import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import PropTypes from "prop-types";
import { Previewer } from "pagedjs";
import { useResizeObserver } from "@mantine/hooks";
import useFormatInfo from "../../../hooks/useFormatInfo";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { getOrInitLibraryYTree } from "../../../lib/ytree";

const FormatPreview = ({ manuscriptData, libraryId }) => {
  const {
    formatData,
    getResolvedValue,
    loading: formatLoading,
  } = useFormatInfo(libraryId);
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);

  // Resize observer for scaling
  const [ref, rect] = useResizeObserver();
  const [scale, setScale] = useState(1);
  const [pagedJsReady, setPagedJsReady] = useState(false);

  const containerRef = useRef(null);
  const pagedJsRef = useRef(new Previewer());

  console.log("Format Data: ", formatData);

  // Sort manuscript data
  const sortedData = useMemo(() => {
    if (!manuscriptData) return [];

    const sectionOrder = {
      frontMatter: 0,
      bodyMatter: 1,
      backMatter: 2,
    };

    return [...manuscriptData].sort((a, b) => {
      const secA = sectionOrder[a.section] ?? 1;
      const secB = sectionOrder[b.section] ?? 1;
      return secA - secB;
    });
  }, [manuscriptData]);

  // Generators for CSS
  const generateCss = useCallback(() => {
    let css = "";

    // Helper: resolve a dotted path fully (item > category > global > default)
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

    // ─── PART 1: GLOBAL RULES & SETUP ──────────────────────────────────────────
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

    const globalTypography = {
      fontFamily: resolve("typography.fontFamily"),
      fontSize: resolve("typography.fontSize"),
      lineHeight: resolve("typography.lineHeight"),
      alignment: resolve("typography.alignment"),
      hyphenation: resolve("typography.hyphenation"),
    };

    let globalSizeRule = `size: ${globalLayout.pageSize} ${globalLayout.orientation};`;
    if (globalLayout.pageSize === "custom") {
      globalSizeRule = `size: ${globalLayout.customWidth}mm ${globalLayout.customHeight}mm;`;
    }

    // Word count calculation for variable replacement
    let totalWords = 0;
    manuscriptData?.forEach((item) => {
      if (item.content) {
        const text = item.content.replace(/<[^>]*>/g, " ").trim();
        if (text) totalWords += text.split(/\s+/).length;
      }
    });

    const manualWordCount = resolve("metadata.wordCount") || 0;
    const wordCountToDisplay =
      manualWordCount > 0 ? manualWordCount : totalWords;
    const formattedWordCount = new Intl.NumberFormat().format(
      wordCountToDisplay,
    );
    const formattedWordCount100 = new Intl.NumberFormat().format(
      Math.round(wordCountToDisplay / 100) * 100,
    );

    // Base Global Style
    css += `
      @page {
        ${globalSizeRule}
        margin-top:    ${globalLayout.marginTop}mm;
        margin-bottom: ${globalLayout.marginBottom}mm;
        margin-left:   ${globalLayout.marginLeft}mm;
        margin-right:  ${globalLayout.marginRight}mm;
        background-color: white;
      }

      /* Manual string-set overrides to bypass Paged.js autofill */
      ${sortedData
        .map((item) => {
          const itemTitle = (item.title || "").replace(/"/g, '\\"');
          return `[data-id="${item.id}"] { string-set: chapterTitle "${itemTitle}"; }`;
        })
        .join("\n")}

      /* Reset browser heading defaults */
      h1, h2, h3, h4, h5, h6 {
        font-size: inherit;
        font-weight: inherit;
        margin: 0;
        padding: 0;
      }

      /* Global container */
      .pagedjs_container {
        font-family: ${globalTypography.fontFamily};
        font-size: ${globalTypography.fontSize}pt;
        line-height: ${globalTypography.lineHeight};
        text-align: ${globalTypography.alignment};
        hyphens: ${globalTypography.hyphenation ? "auto" : "none"};
        width: 100%;
        color: black;
        background-color: gray;
      }

      /* Lists */
      #FormatPreviewContent ul { list-style-type: disc; margin-left: ${resolve("typography.list.listIndent")}pt; }
      #FormatPreviewContent ol { list-style-type: ${resolve("typography.list.orderedListStyle")}; margin-left: ${resolve("typography.list.listIndent")}pt; }

      /* Media safety */
      #FormatPreviewContent img, #FormatPreviewContent video, #FormatPreviewContent svg {
        max-width: 100%;
        height: auto;
      }

      /* Global Special elements */
      #FormatPreviewContent [data-category="title_page"] {
        text-align: ${resolve("specialElements.titlePageCentered") ? "center" : "inherit"};
        font-size:  ${resolve("specialElements.titlePageFontSize")}pt;
      }
        
      #FormatPreviewContent [data-category="part_divider"] {
        text-align: ${resolve("specialElements.partDividerCentered") ? "center" : "inherit"};
        font-size:  ${resolve("specialElements.partDividerFontSize")}pt;
      }
      #FormatPreviewContent [data-category="epigraph"] {
        font-style: ${resolve("specialElements.epigraphItalic") ? "italic" : "normal"};
        text-align: ${resolve("specialElements.epigraphAlignment")};
        font-size:  ${resolve("specialElements.epigraphFontSize")}pt;
      }

      .running-contact {
        position: running(contactRunning);
        white-space: pre-wrap;
      }

      .dynamic-page::after { content: counter(page); }
      .dynamic-pages::after { content: counter(pages); }
    `;

    // ─── PART 2: ITEM-SPECIFIC PASS ───────────────────────────────────────────
    sortedData.forEach((item) => {
      if (item.type !== "paper") return;
      const { id, category } = item;
      const resolveItem = (p) => resolve(p, category, id);

      // Item Headers & Footers
      const hf = {
        enabled: resolveItem("marginHeaderFooters.enabled") ?? true,
        font: resolveItem("marginHeaderFooters.fontFamily") || "Inter",
        headerSize: resolveItem("marginHeaderFooters.headerSize") || 9,
        headerLineHeight:
          resolveItem("marginHeaderFooters.headerLineHeight") || 1.2,
        footerSize: resolveItem("marginHeaderFooters.footerSize") || 9,
        footerLineHeight:
          resolveItem("marginHeaderFooters.footerLineHeight") || 1.2,
        vAlign: resolveItem("marginHeaderFooters.verticalAlign") || "middle",
        topLeftCorner: resolveItem("marginHeaderFooters.topLeftCorner"),
        topLeft: resolveItem("marginHeaderFooters.topLeft"),
        topCenter: resolveItem("marginHeaderFooters.topCenter"),
        topRight: resolveItem("marginHeaderFooters.topRight"),
        topRightCorner: resolveItem("marginHeaderFooters.topRightCorner"),
        bottomLeftCorner: resolveItem("marginHeaderFooters.bottomLeftCorner"),
        bottomLeft: resolveItem("marginHeaderFooters.bottomLeft"),
        bottomCenter: resolveItem("marginHeaderFooters.bottomCenter"),
        bottomRight: resolveItem("marginHeaderFooters.bottomRight"),
        bottomRightCorner: resolveItem("marginHeaderFooters.bottomRightCorner"),
        leftTop: resolveItem("marginHeaderFooters.leftTop"),
        leftMiddle: resolveItem("marginHeaderFooters.leftMiddle"),
        leftBottom: resolveItem("marginHeaderFooters.leftBottom"),
        rightTop: resolveItem("marginHeaderFooters.rightTop"),
        rightMiddle: resolveItem("marginHeaderFooters.rightMiddle"),
        pageNumberFormat:
          resolveItem("marginHeaderFooters.pageNumberFormat") || "decimal",
      };

      const dynBeforeFS = resolveItem("dynamicContent.beforeFontSize") || 12;
      const dynBeforeLH = resolveItem("dynamicContent.beforeLineHeight") || 1.5;
      const dynAfterFS = resolveItem("dynamicContent.afterFontSize") || 12;
      const dynAfterLH = resolveItem("dynamicContent.afterLineHeight") || 1.5;

      css += `
        [data-id="${id}"] .dynamic-before-content {
          display: inline-block;
          width: 100%;
          height: fit-content;
          font-size: ${dynBeforeFS}pt;
          line-height: ${dynBeforeLH};
          white-space: pre-wrap;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        [data-id="${id}"] .dynamic-after-content {
          display: inline-block;
          width: 100%;
          height: fit-content;
          font-size: ${dynAfterFS}pt;
          line-height: ${dynAfterLH};
          white-space: pre-wrap;
          overflow-wrap: break-word;
          word-break: break-word;
        }
      `;

      const msTitle = resolveItem("metadata.title.main") || "Untitled";
      const msAuthor = resolveItem("metadata.creator.name") || "Unknown Author";
      const msDate = resolveItem("metadata.publication.date") || "";

      const processContent = (text) => {
        if (!text) return '""';
        if (!text.includes("{")) return `"${text.replace(/"/g, '\\"')}"`;
        const parts = text.split(/({[^}]+})/g);
        const cssParts = parts
          .map((part) => {
            if (part === "{page}")
              return `counter(page, ${hf.pageNumberFormat})`;
            if (part === "{pages}")
              return `counter(pages, ${hf.pageNumberFormat})`;
            if (part === "{title}") return `"${msTitle.replace(/"/g, '\\"')}"`;
            if (part === "{author}")
              return `"${msAuthor.replace(/"/g, '\\"')}"`;
            if (part === "{chapterTitle}") return "string(chapterTitle)";
            if (part === "{date}") return `"${msDate.replace(/"/g, '\\"')}"`;
            if (part === "{contact}") return "element(contactRunning)";
            if (part === "{words}")
              return `"about ${formattedWordCount} words"`;
            if (part === "{words100}")
              return `"about ${formattedWordCount100} words"`;
            if (part === "{newline}") return '"\\A"';
            if (part === "{tab}") return `"${"\\A0".repeat(4)}"`;
            if (part === "{sep}") return '"/"';
            const spaceMatch = part.match(/^{(\d+)_spaces}$/);
            if (spaceMatch) {
              const count = parseInt(spaceMatch[1], 10);
              return `"${"\\A0".repeat(count)}"`;
            }
            const newlineMatch = part.match(/^{(\d+)_newlines}$/i);
            if (newlineMatch) {
              const count = parseInt(newlineMatch[1], 10);
              return `"${"\\A".repeat(count)}"`;
            }
            if (part.match(/^{.*}$/)) return `"${part.replace(/"/g, '\\"')}"`;
            if (part === "") return null;
            return `"${part.replace(/"/g, '\\"')}"`;
          })
          .filter(Boolean);
        return cssParts.join(" ");
      };

      const generateMarginBoxes = () => {
        if (!hf.enabled) return "";
        const boxMap = {
          "@top-left-corner": {
            content: hf.topLeftCorner,
            h: "left",
            v: "middle",
            key: "topLeftCorner",
          },
          "@top-left": {
            content: hf.topLeft,
            h: "left",
            v: "middle",
            key: "topLeft",
          },
          "@top-center": {
            content: hf.topCenter,
            h: "center",
            v: "middle",
            key: "topCenter",
          },
          "@top-right": {
            content: hf.topRight,
            h: "right",
            v: "middle",
            key: "topRight",
          },
          "@top-right-corner": {
            content: hf.topRightCorner,
            h: "right",
            v: "middle",
            key: "topRightCorner",
          },
          "@bottom-left-corner": {
            content: hf.bottomLeftCorner,
            h: "left",
            v: "middle",
            key: "bottomLeftCorner",
          },
          "@bottom-left": {
            content: hf.bottomLeft,
            h: "left",
            v: "middle",
            key: "bottomLeft",
          },
          "@bottom-center": {
            content: hf.bottomCenter,
            h: "center",
            v: "middle",
            key: "bottomCenter",
          },
          "@bottom-right": {
            content: hf.bottomRight,
            h: "right",
            v: "middle",
            key: "bottomRight",
          },
          "@bottom-right-corner": {
            content: hf.bottomRightCorner,
            h: "right",
            v: "middle",
            key: "bottomRightCorner",
          },
          "@left-top": {
            content: hf.leftTop,
            h: "left",
            v: "top",
            key: "leftTop",
          },
          "@left-bottom": {
            content: hf.leftBottom,
            h: "left",
            v: "bottom",
            key: "leftBottom",
          },
          "@right-top": {
            content: hf.rightTop,
            h: "right",
            v: "top",
            key: "rightTop",
          },
          "@right-bottom": {
            content: hf.rightBottom,
            h: "right",
            v: "bottom",
            key: "rightBottom",
          },
        };

        let rules = "";
        Object.entries(boxMap).forEach(([selector, config]) => {
          if (config.content) {
            const hAlign = resolveItem(
              `marginHeaderFooters.${config.key}HAlign`,
            );
            const vAlign = resolveItem(
              `marginHeaderFooters.${config.key}VAlign`,
            );
            const finalH = hAlign === "inherit" || !hAlign ? config.h : hAlign;
            const finalV = vAlign === "inherit" || !vAlign ? hf.vAlign : vAlign;

            const isHeader =
              selector.includes("top") ||
              (selector.includes("corner") && selector.includes("top")) ||
              selector.includes("left-top") ||
              selector.includes("right-top");
            const isFooter =
              selector.includes("bottom") ||
              (selector.includes("corner") && selector.includes("bottom")) ||
              selector.includes("left-bottom") ||
              selector.includes("right-bottom");

            // Conditional rendering logic:
            // - if break before then display header
            // - if break after then display footer
            // (Always display in global scope)
            const hasBreakBefore =
              breakBefore && breakBefore !== "auto" && breakBefore !== "avoid";
            const hasBreakAfter =
              breakAfter && breakAfter !== "auto" && breakAfter !== "avoid";

            if (category !== "global") {
              if (isHeader && !hasBreakBefore) return;
              if (isFooter && !hasBreakAfter) return;
            }

            const finalSize = isFooter ? hf.footerSize : hf.headerSize;
            const finalLH = isFooter
              ? hf.footerLineHeight
              : hf.headerLineHeight;

            rules += `
            ${selector} {
              content: ${processContent(config.content)};
              font-family: "${hf.font}";
              font-size: ${finalSize}pt;
              line-height: ${finalLH};
              vertical-align: ${finalV};
              text-align: ${finalH};
              white-space: pre-wrap;
            }
          `;
          }
        });
        return rules;
      };

      // Typography
      const fontFamily = resolveItem("typography.fontFamily");
      const fontSize = resolveItem("typography.fontSize");
      const lineHeight = resolveItem("typography.lineHeight");
      const alignment = resolveItem("typography.alignment");
      const hyphenation = resolveItem("typography.hyphenation");
      const pSpaceBefore = resolveItem("typography.pSpaceBefore");
      const pSpaceAfter = resolveItem("typography.pSpaceAfter");
      const firstLineIndent = resolveItem("typography.firstLineIndent");
      const indentWidthValue = resolveItem("typography.indentWidthValue");

      // Advanced
      const borderStyle = resolveItem("advanced.borderStyle");
      const borderWidth = resolveItem("advanced.borderWidth");
      const borderColor = resolveItem("advanced.borderColor");
      const borderRadius = resolveItem("advanced.borderRadius");
      const bgColor = resolveItem("advanced.backgroundColor");
      const padding = resolveItem("advanced.padding");

      // Title Styling
      const titleSection =
        category === "chapter" ? "titleFormat" : "normalTitleFormat";
      const titleFontFamily = resolve(
        `${titleSection}.fontFamily`,
        category,
        id,
      );
      const titleFontSize = resolve(`${titleSection}.fontSize`, category, id);
      const titleLineHeight = resolve(
        `${titleSection}.lineHeight`,
        category,
        id,
      );
      const titleAlign = resolve(
        `${titleSection}.titleAlignment`,
        category,
        id,
      );
      const subAlign = resolve(
        `${titleSection}.subtitleAlignment`,
        category,
        id,
      );
      const titleSBefore = resolve(
        `${titleSection}.spacingBefore`,
        category,
        id,
      );
      const titleSAfter = resolve(`${titleSection}.spacingAfter`, category, id);
      const subItalic = resolve(`${titleSection}.subtitleItalic`, category, id);
      const subFont = resolve(
        `${titleSection}.subtitleFontFamily`,
        category,
        id,
      );
      const subSize = resolve(`${titleSection}.subtitleFontSize`, category, id);
      const subLine = resolve(
        `${titleSection}.subtitleLineHeight`,
        category,
        id,
      );

      const resolvedTitleFont =
        titleFontFamily === "inherit" || !titleFontFamily
          ? fontFamily
          : titleFontFamily;
      const resolvedSubFont =
        subFont === "inherit" || !subFont ? fontFamily : subFont;

      const breakBefore = resolveItem("layout.breakBefore") || "auto";
      const breakAfter = resolveItem("layout.breakAfter") || "auto";

      css += `
        @page item-${id} {
          margin-top:    ${resolveItem("layout.marginTop")}mm;
          margin-bottom: ${resolveItem("layout.marginBottom")}mm;
          margin-left:   ${resolveItem("layout.marginLeft")}mm;
          margin-right:  ${resolveItem("layout.marginRight")}mm;
          ${generateMarginBoxes()}
        }

        /* ── Item: ${id} (${category}) ── */
        [data-id="${id}"] {
          font-family:      ${fontFamily};
          font-size:        ${fontSize}pt;
          line-height:      ${lineHeight};
          text-align:       ${alignment};
          hyphens:          ${hyphenation ? "auto" : "none"};
          border-style:     ${borderStyle};
          border-width:     ${borderWidth}px;
          border-color:     ${borderColor};
          border-radius:    ${borderRadius}px;
          background-color: ${bgColor};
          padding:          ${padding}pt;
          break-before:     avoid;
          break-after:      avoid;
          page:             item-${id};
        }

        [data-id="${id}"] p {
          margin-top:    ${pSpaceBefore}pt;
          margin-bottom: ${pSpaceAfter}pt;
          text-indent:   ${firstLineIndent ? `${indentWidthValue}pt` : "0"};
        }

        /* Nested indents */
        [data-id="${id}"] p[data-indent="1"] { padding-left: ${indentWidthValue * 0}pt; }
        [data-id="${id}"] p[data-indent="2"] { padding-left: ${indentWidthValue * 1}pt; }
        [data-id="${id}"] p[data-indent="3"] { padding-left: ${indentWidthValue * 2}pt; }
        [data-id="${id}"] p[data-indent="4"] { padding-left: ${indentWidthValue * 3}pt; }
        [data-id="${id}"] p[data-indent="5"] { padding-left: ${indentWidthValue * 4}pt; }

        [data-id="${id}"] p:first-of-type {
          text-indent: 0 !important;
        }

        [data-id="${id}"] .manuscript-title-block {
          margin-top:    ${titleSBefore}pt;
          margin-bottom: ${titleSAfter}pt;
        }

        [data-id="${id}"] .manuscript-title {
          font-family:  ${resolvedTitleFont};
          font-size:    ${titleFontSize}pt !important;
          line-height:  ${titleLineHeight};
          text-align:   ${titleAlign} !important;
          font-weight:  normal;
        }

        [data-id="${id}"] .manuscript-subtitle {
          font-family: ${resolvedSubFont};
          font-size:   ${subSize}pt !important;
          line-height: ${subLine};
          text-align:  ${subAlign} !important;
          font-style:  ${subItalic ? "italic" : "normal"};
          margin-top:  0.5em;
        }
      `;
    });

    return css;
  }, [getResolvedValue, sortedData, manuscriptData]);

  // Fetch Usage
  useEffect(() => {
    let active = true;

    const fetchContent = async () => {
      if (formatLoading || !libraryId || !sortedData.length) return;

      setLoading(true);
      try {
        const libraryYTree = await getOrInitLibraryYTree(libraryId);

        // Pre-calculate chapter numbering to avoid async issues
        const chapterIndices = {};
        let currentChapterCount = 0;
        sortedData.forEach((item) => {
          if (item.type === "paper" && item.category === "chapter") {
            currentChapterCount++;
            chapterIndices[item.id] = currentChapterCount;
          }
        });

        const firstPaperIndex = sortedData.findIndex((i) => i.type === "paper");
        const metadata = formatData?.global?.metadata || {};
        const bookTitle = metadata.title?.text || "";
        const bookAuthor = metadata.creator?.text || "";
        const pubDate = metadata.publication?.date || "";
        const contactInfo = metadata.contactInfo || "";

        let totalWords = 0;
        manuscriptData?.forEach((item) => {
          if (item.content) {
            const text = item.content.replace(/<[^>]*>/g, " ").trim();
            if (text) totalWords += text.split(/\s+/).length;
          }
        });

        const manualWordCount =
          getResolvedValue("global", null, null, "metadata", "wordCount")
            ?.value || 0;
        const wordCountToDisplay =
          manualWordCount > 0 ? manualWordCount : totalWords;
        const formattedWordCount = new Intl.NumberFormat().format(
          wordCountToDisplay,
        );
        const formattedWordCount100 = new Intl.NumberFormat().format(
          Math.round(wordCountToDisplay / 100) * 100,
        );

        const metadataStoreHtml = `
          <div class="metadata-store" style="visibility: hidden; height: 0; overflow: hidden; position: absolute;">
            <div class="metadata-title">${bookTitle}</div>
            <div class="metadata-author">${bookAuthor}</div>
            <div class="metadata-date">${pubDate}</div>
            <div class="running-contact">${contactInfo.replace(/\n/g, "<br>")}</div>
          </div>
        `;

        const itemPromises = sortedData.map(async (item, index) => {
          if (item.type !== "paper") return null;

          const chapterNum = chapterIndices[item.id];

          let classes = [
            `manuscript-item section-${item.section} category-${item.category}`,
          ];

          const html = await dataManagerSubdocs.getHtmlFromPaper(
            libraryYTree,
            item.sourceId,
          );

          // Get resolved title format and other settings
          const getVal = (key) =>
            getResolvedValue("item", item.id, item.category, "titleFormat", key)
              .value;

          const tConfig = {
            prefix: getVal("prefix"),
            useAsPrefix: getVal("useItemTitleAsPrefix"),
            numberStyle: getVal("numberStyle"),
            suffix: getVal("suffix"),
            useAsSuffix: getVal("useItemTitleAsSuffix"),
            subtitle: getVal("subtitle"),
            useAsSubtitle: getVal("useItemTitleAsSubtitle"),
            includeNumber: getVal("includeNumber"),
            includeTitle: getVal("includeTitle"),
          };

          // Manual indent replacement is replaced by CSS rules using data-indent
          let processedHtml = html;

          // Generate Title Block
          let titleBlock = "";
          if (item.category === "chapter") {
            const prefix = tConfig.useAsPrefix ? item.title : tConfig.prefix;
            const suffix = tConfig.useAsSuffix ? item.title : tConfig.suffix;
            const subtitle = tConfig.useAsSubtitle
              ? item.title
              : tConfig.subtitle;

            // Simple numbering for now (could be expanded to roman/word)
            let num =
              tConfig.numberStyle === "none" || !tConfig.includeNumber
                ? ""
                : ` ${chapterNum}`;

            titleBlock = `
              <div class="manuscript-title-block">
                ${tConfig.includeTitle ? `<h1 class="manuscript-title">${`${prefix}${num}${suffix}`.trim()}</h1>` : ""}
                ${subtitle ? `<p class="manuscript-subtitle">${subtitle}</p>` : ""}
              </div>
            `;
          } else {
            // Normal Title Format for non-chapters
            const ntGetVal = (key) =>
              getResolvedValue(
                "item",
                item.id,
                item.category,
                "normalTitleFormat",
                key,
              ).value;

            const ntConfig = {
              title: ntGetVal("title"),
              useAsTitle: ntGetVal("useItemTitleAsTitle"),
              subtitle: ntGetVal("subtitle"),
              useAsSubtitle: ntGetVal("useItemTitleAsSubtitle"),
            };

            const title = ntConfig.useAsTitle ? item.title : ntConfig.title;
            const subtitle = ntConfig.useAsSubtitle
              ? item.title
              : ntConfig.subtitle;

            if (title || subtitle) {
              titleBlock = `
                <div class="manuscript-title-block">
                  ${title ? `<h1 class="manuscript-title">${title}</h1>` : ""}
                  ${subtitle ? `<p class="manuscript-subtitle">${subtitle}</p>` : ""}
                </div>
              `;
            }
          }

          const isFirstPaper = index === firstPaperIndex;

          const resolveDynamic = (text) => {
            if (!text) return "";
            return String(text)
              .replace(/{author}/g, bookAuthor)
              .replace(/{words}/g, formattedWordCount)
              .replace(/{words100}/g, formattedWordCount100)
              .replace(/{contact}/g, contactInfo.replace(/\n/g, "<br>"))
              .replace(/{page}/g, '<span class="dynamic-page"></span>')
              .replace(/{pages}/g, '<span class="dynamic-pages"></span>')
              .replace(/{tab}/gi, "&nbsp;&nbsp;&nbsp;&nbsp;")
              .replace(/{(\d+)_spaces}/g, (_, count) =>
                "&nbsp;".repeat(parseInt(count, 10)),
              )
              .replace(/{(\d+)_newlines}/gi, (_, count) =>
                "<br>".repeat(parseInt(count, 10)),
              )
              .replace(/\n/g, "<br>");
          };

          const dynBefore = getResolvedValue(
            "item",
            item.id,
            item.category,
            "dynamicContent",
            "beforePageContent",
          ).value;
          const dynAfter = getResolvedValue(
            "item",
            item.id,
            item.category,
            "dynamicContent",
            "afterPageContent",
          ).value;

          const beforeHtml = dynBefore
            ? `<div class="dynamic-before-content">${resolveDynamic(dynBefore)}</div>`
            : "";
          const afterHtml = dynAfter
            ? `<div class="dynamic-after-content">${resolveDynamic(dynAfter)}</div>`
            : "";

          return `
                <div class="${classes.join(" ")}" 
                     data-category="${item.category}"
                     data-id="${item.id}">
                    ${isFirstPaper ? metadataStoreHtml : ""}
                    ${beforeHtml}
                    ${titleBlock}
                    ${processedHtml}
                    ${afterHtml}
                </div>
            `;
        });

        const results = await Promise.all(itemPromises);

        if (active) {
          const fullHtml = `
              <div class="pagedjs-content">
                    ${results.filter(Boolean).join("")}
              </div>
            `;

          console.log("Generated Preview HTML: ", fullHtml);

          setPreviewHtml(fullHtml);
          setPagedJsReady(false); // Reset ready state when content updates
        }
      } catch (err) {
        console.error("Error fetching preview content", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContent();

    return () => {
      active = false;
    };
  }, [
    libraryId,
    sortedData,
    formatLoading,
    generateCss,
    getResolvedValue,
    formatData,
    manuscriptData,
  ]);

  // Paged.js Rendering
  useLayoutEffect(() => {
    if (!previewHtml || !containerRef.current) return;

    const purgePagedJsStyles = () => {
      const styles = document.querySelectorAll(
        'style[data-pagedjs-inserted="true"], .pagedjs_styles',
      );
      styles.forEach((style) => style.remove());
      console.log(`Purged ${styles.length} Paged.js style tags.`);
    };

    const render = async () => {
      // Clear previous content
      containerRef.current.innerHTML = "";
      purgePagedJsStyles();

      const css = generateCss();
      // Create CSS Blob URL
      const cssBlob = new Blob([css], { type: "text/css" });
      const cssUrl = URL.createObjectURL(cssBlob);

      try {
        await pagedJsRef.current.preview(
          previewHtml,
          [cssUrl],
          containerRef.current,
        );
        setPagedJsReady(true);
      } catch (e) {
        console.error("PagedJS Render Error", e);
      } finally {
        URL.revokeObjectURL(cssUrl);
      }
    };

    render();

    return () => {
      purgePagedJsStyles();
    };
  }, [previewHtml, generateCss]);

  // Calculate Scale to fit width
  useEffect(() => {
    if (!pagedJsReady || !rect.width || !containerRef.current) return;

    const pages = containerRef.current.querySelectorAll(".pagedjs_page");
    if (pages.length > 0) {
      const pageWidth = pages[0].offsetWidth; // includes standard margins/padding of pagedjs page
      // Add some padding buffer (e.g. 40px)
      const availableWidth = rect.width - 40;

      let newScale = 1;
      if (pageWidth > availableWidth) {
        newScale = availableWidth / pageWidth;
      }

      setScale(newScale);
    }
  }, [pagedJsReady, rect.width]);

  return (
    <div
      id="FormatPreviewContent"
      ref={ref}
      className="w-full grow basis-0 rounded-lg relative overflow-y-auto bg-gray-100 flex flex-col items-center p-4 overflow-x-hidden"
    >
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50">
          <div className="text-lg font-semibold">Loading Preview...</div>
        </div>
      )}

      <div
        ref={containerRef}
        className="pagedjs_container shadow-lg bg-white"
        style={{
          minHeight: "100%",
          width: "auto",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      />

      {/* Style to constrain PagedJS pages to view */}
      <style>{`
            .pagedjs_pages {
                display: flex;
                flex-direction: column;
                align-items: center;
                transform-origin: top center;
                width: 100%;
            }
            .pagedjs_page {
                margin-bottom: 2rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
        `}</style>
    </div>
  );
};

FormatPreview.propTypes = {
  manuscriptData: PropTypes.array,
  libraryId: PropTypes.string.isRequired,
};

export default FormatPreview;
