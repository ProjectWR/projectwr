import { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  SectionType,
} from "docx";
import { tempDir, join } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import useFormatInfo from "../../../hooks/useFormatInfo";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { getOrInitLibraryYTree } from "../../../lib/ytree";
import { PAGE_SIZE_PRESETS } from "./formatConstants";

/**
 * A previewer that takes the manuscriptData and libraryId, resolves formatting
 * data, natively builds a `docx.Document`, generates a Blob via `Packer`, and
 * saves it to a temporary file which is opened in the user's local docx editor.
 */
const DocxPreview = ({ manuscriptData, libraryId }) => {
  const { getResolvedValue, loading: formatLoading } = useFormatInfo(libraryId);

  const [isGenerating, setIsGenerating] = useState(false);

  // Sort manuscript data (mirrors FormatPreview logic)
  const sortedData = useMemo(() => {
    if (!manuscriptData) return [];
    const sectionOrder = { frontMatter: 0, bodyMatter: 1, backMatter: 2 };
    return [...manuscriptData].sort((a, b) => {
      const secA = sectionOrder[a.section] ?? 1;
      const secB = sectionOrder[b.section] ?? 1;
      return secA - secB;
    });
  }, [manuscriptData]);

  // Builds the docx Document natively
  const buildDocxDocument = useCallback(async () => {
    // -- Resolvers (Mirroring FormatPreview) --
    const resolve = (path, category = null, id = null) => {
      const parts = path.split(".");
      const section = parts[0];
      const key = parts.slice(1).join(".");

      let scope = "global";
      let targetId = null;
      let targetCategory = null;

      if (id) {
        scope = "item";
        targetId = id;
        targetCategory = category;
      } else if (category) {
        scope = "category";
        targetId = category;
      }

      return getResolvedValue(scope, targetId, targetCategory, section, key)
        .value;
    };

    // Global properties
    const globalLayout = {
      pageSize: resolve("layout.pageSize"),
      orientation: resolve("layout.orientation"),
      customWidth: resolve("layout.customWidth"),
      customHeight: resolve("layout.customHeight"),
      marginTop: resolve("layout.marginTop"),
      marginBottom: resolve("layout.marginBottom"),
      marginLeft: resolve("layout.marginLeft"),
      marginRight: resolve("layout.marginRight"),
    };

    // mm to TWIPs (Twentieth of a Point). 1 mm = 56.6929133858 twip
    const mmToTwip = (mm) => Math.round(mm * 56.6929133858);

    const preset =
      PAGE_SIZE_PRESETS[globalLayout.pageSize] || PAGE_SIZE_PRESETS.trade;
    const docSize = {
      width:
        globalLayout.pageSize === "custom"
          ? mmToTwip(globalLayout.customWidth)
          : mmToTwip(preset.width),
      height:
        globalLayout.pageSize === "custom"
          ? mmToTwip(globalLayout.customHeight)
          : mmToTwip(preset.height),
      orientation:
        globalLayout.orientation === "landscape" ? "landscape" : "portrait",
    };

    const docMargins = {
      top: mmToTwip(globalLayout.marginTop),
      bottom: mmToTwip(globalLayout.marginBottom),
      left: mmToTwip(globalLayout.marginLeft),
      right: mmToTwip(globalLayout.marginRight),
    };

    const globalTypography = {
      fontFamily: resolve("typography.fontFamily"),
      fontSize: resolve("typography.fontSize") * 2, // docx uses half-points
      alignment: resolve("typography.alignment"),
    };

    const alignMap = {
      left: AlignmentType.LEFT,
      center: AlignmentType.CENTER,
      right: AlignmentType.RIGHT,
      justify: AlignmentType.JUSTIFIED,
    };

    // Calculate chapters
    const chapterIndices = {};
    let currentChapterCount = 0;
    sortedData.forEach((item) => {
      if (item.type === "paper" && item.category === "chapter") {
        currentChapterCount++;
        chapterIndices[item.id] = currentChapterCount;
      }
    });

    const sections = [];
    const libraryYTree = await getOrInitLibraryYTree(libraryId);

    for (let i = 0; i < sortedData.length; i++) {
      const item = sortedData[i];
      if (item.type !== "paper") continue;

      const { id, category } = item;
      const resolveItem = (p) => resolve(p, category, id);

      const chapterNum = chapterIndices[id];
      const breakBefore = resolveItem("layout.breakBefore") || "auto";

      const titleSection =
        category === "chapter" ? "titleFormat" : "normalTitleFormat";
      const tGetVal = (key) => resolveItem(`${titleSection}.${key}`);

      // Get ProseMirror/Tiptap JSON
      const docJson = await dataManagerSubdocs.getJsonFromPaper(
        libraryYTree,
        item.sourceId,
      );

      // Recursive function to parse ProseMirror nodes into Docx elements
      const parseNode = (node, parentType = "doc", listLevel = 0) => {
        if (!node) return null;

        const marks = node.marks || [];
        const isBold = marks.some((m) => m.type === "bold");
        const isItalic = marks.some((m) => m.type === "italic");
        const isUnderline = marks.some((m) => m.type === "underline");
        const isStrike = marks.some((m) => m.type === "strike");
        const isSubscript = marks.some((m) => m.type === "subscript");
        const isSuperscript = marks.some((m) => m.type === "superscript");
        const textStyleMark = marks.find((m) => m.type === "textStyle");
        const highlightMark = marks.find((m) => m.type === "highlight");

        const attrs = node.attrs || {};

        if (node.type === "text") {
          return new TextRun({
            text: node.text,
            bold: isBold,
            italics: isItalic,
            underline: isUnderline ? { type: "single" } : undefined,
            strike: isStrike,
            subScript: isSubscript,
            superScript: isSuperscript,
            font: globalTypography.fontFamily,
            size: globalTypography.fontSize,
            color: textStyleMark?.attrs?.color
              ? textStyleMark.attrs.color.replace("#", "")
              : undefined,
            highlight: highlightMark?.attrs?.color
              ? highlightMark.attrs.color.replace("#", "")
              : undefined,
          });
        }

        if (node.type === "paragraph") {
          const children = (node.content || [])
            .map((child) => parseNode(child, "paragraph"))
            .filter(Boolean);

          let pAlignment = alignMap[globalTypography.alignment];
          if (attrs.textAlign) {
            pAlignment = alignMap[attrs.textAlign] || pAlignment;
          }

          let indentProps = {};
          if (attrs.indent > 0) {
            indentProps = {
              left: attrs.indent * 720, // rough conversion of indent level (0.5 inch / 720 twips)
            };
          }

          if (parentType === "listItem") {
            // paragraph inside list item, don't wrap it in an extra Paragraph object if we let the list item handle it,
            // but docx natively expects paragraphs inside list items.
            // Actually docx.Paragraph *is* the list item in docx, so we merge them.
            return children;
          }

          return new Paragraph({
            children: children,
            alignment: pAlignment,
            indent: indentProps,
          });
        }

        if (node.type === "heading") {
          const children = (node.content || [])
            .map((child) => parseNode(child, "heading"))
            .filter(Boolean);

          let hAlignment = AlignmentType.LEFT;
          if (attrs.textAlign) {
            hAlignment = alignMap[attrs.textAlign] || hAlignment;
          }

          const levelMap = {
            1: HeadingLevel.HEADING_1,
            2: HeadingLevel.HEADING_2,
            3: HeadingLevel.HEADING_3,
            4: HeadingLevel.HEADING_4,
            5: HeadingLevel.HEADING_5,
            6: HeadingLevel.HEADING_6,
          };

          return new Paragraph({
            children: children,
            heading: levelMap[attrs.level] || HeadingLevel.HEADING_1,
            alignment: hAlignment,
          });
        }

        if (node.type === "bulletList") {
          return (node.content || [])
            .map((child) => parseNode(child, "bulletList", listLevel + 1))
            .flat()
            .filter(Boolean)
            .map((p) => {
              p.root[1].bullet = { level: listLevel }; // basic patching for bullet
              return p;
            });
        }

        if (node.type === "orderedList") {
          // We would need a custom numbering config in docx for full support
          return (node.content || [])
            .map((child) => parseNode(child, "orderedList", listLevel + 1))
            .flat()
            .filter(Boolean);
        }

        if (node.type === "listItem") {
          // In docx, a list item is just a paragraph with bullet/numbering properties.
          const children = (node.content || [])
            .map((child) => parseNode(child, "listItem", listLevel))
            .flat()
            .filter(Boolean);

          return new Paragraph({
            children: children,
            bullet:
              parentType === "bulletList" ? { level: listLevel } : undefined,
            // numbering: parentType === "orderedList" ? { reference: "default-numbering", level: listLevel } : undefined // requires document numbering config
          });
        }

        if (node.type === "blockquote") {
          const children = (node.content || [])
            .map((child) => parseNode(child, "blockquote"))
            .flat()
            .filter(Boolean);

          // Wrapping the elements in blockquote styling
          return children.map((p) => {
            // Return a heavily indented paragraph
            return new Paragraph({
              children: p.root.filter((c) => c instanceof TextRun),
              indent: { left: 720 }, // 0.5 inch
              border: {
                left: {
                  color: "CCCCCC",
                  space: 1,
                  style: "single",
                  size: 6,
                },
              },
            });
          });
        }

        if (node.type === "hardBreak") {
          // You can't insert a hard break node directly in children array easily if it's mixed with TextRuns.
          // Usually we handle this by inserting a special TextRun with a break.
          return new TextRun({ break: 1 });
        }

        if (node.type === "horizontalRule") {
          return new Paragraph({
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          });
        }

        // Return empty or unhandled nodes inside a collection
        if (node.content) {
          return node.content
            .map((child) => parseNode(child, parentType, listLevel))
            .flat()
            .filter(Boolean);
        }

        return null;
      };

      const domParserElements = (docJson.content || [])
        .map((node) => parseNode(node))
        .flat()
        .filter(Boolean);

      const titleBlock = [];
      if (category === "chapter") {
        const prefix = tGetVal("useItemTitleAsPrefix")
          ? item.title
          : tGetVal("prefix");
        const suffix = tGetVal("useItemTitleAsSuffix")
          ? item.title
          : tGetVal("suffix");
        const numStyle = tGetVal("numberStyle");
        const incNum = tGetVal("includeNumber");

        let numStr =
          numStyle === "none" || !incNum || !chapterNum ? "" : ` ${chapterNum}`;
        let titleStr = tGetVal("includeTitle")
          ? `${prefix}${numStr}${suffix}`.trim()
          : "";

        if (titleStr) {
          titleBlock.push(
            new Paragraph({
              text: titleStr,
              heading: HeadingLevel.HEADING_1,
              alignment:
                alignMap[tGetVal("titleAlignment")] || AlignmentType.CENTER,
            }),
          );
        }
      } else {
        const titleStr = tGetVal("useItemTitleAsTitle")
          ? item.title
          : tGetVal("title");
        if (titleStr) {
          titleBlock.push(
            new Paragraph({
              text: titleStr,
              heading: HeadingLevel.HEADING_1,
              alignment:
                alignMap[tGetVal("titleAlignment")] || AlignmentType.CENTER,
            }),
          );
        }
      }

      sections.push({
        properties: {
          type:
            breakBefore === "page" ||
            breakBefore === "right" ||
            breakBefore === "left" ||
            i === 0
              ? SectionType.NEXT_PAGE
              : SectionType.CONTINUOUS,
          page: {
            margin: docMargins,
            size: docSize,
          },
        },
        children: [
          ...titleBlock,
          ...(titleBlock.length > 0 ? [new Paragraph({ text: "" })] : []), // spacer
          ...domParserElements,
        ],
      });
    }

    const doc = new Document({
      sections: sections,
    });

    return doc;
  }, [getResolvedValue, sortedData, libraryId]);

  const handleOpenDocx = async () => {
    if (formatLoading || !libraryId || !sortedData.length || isGenerating)
      return;
    setIsGenerating(true);

    try {
      const doc = await buildDocxDocument();
      const blob = await Packer.toBlob(doc);
      const buffer = await blob.arrayBuffer();

      const tmpDirPath = await tempDir();
      const filePath = await join(tmpDirPath, `preview_${Date.now()}.docx`);

      await writeFile(filePath, new Uint8Array(buffer));
      await openPath(filePath);
    } catch (err) {
      console.error("Docx Open Error: ", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full relative p-4 pr-0 pt-0 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
      <button
        onClick={handleOpenDocx}
        disabled={isGenerating || formatLoading}
        className="flex items-center text-libraryDirectoryBookNodeFontSize gap-2 px-2 py-1 hover:bg-appLayoutInverseHover border border-appLayoutBorder  disabled:cursor-not-allowed text-appLayoutText hover:text-appLayoutHighlight rounded-md transition-colors w-fit"
      >
        {isGenerating ? (
          <>
            <span className="icon-[line-md--loading-twotone-loop] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
            Generating...
          </>
        ) : (
          <>
            <span className="icon-[line-md--external-link] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
            Open preview in local DOCX editor
          </>
        )}
      </button>
    </div>
  );
};

DocxPreview.propTypes = {
  manuscriptData: PropTypes.array,
  libraryId: PropTypes.string,
};

export default DocxPreview;
