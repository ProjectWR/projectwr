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

    // ─── PART 1: GLOBAL RULES ──────────────────────────────────────────────────
    // Page size & margins  (global only – Paged.js @page rules can't be scoped)
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
      pSpaceBefore: resolve("typography.pSpaceBefore"),
      pSpaceAfter: resolve("typography.pSpaceAfter"),
      firstLineIndent: resolve("typography.firstLineIndent"),
      firstLineIndentValue: resolve("typography.firstLineIndentValue"),
    };

    let globalSizeRule = `size: ${globalLayout.pageSize} ${globalLayout.orientation};`;
    if (globalLayout.pageSize === "custom") {
      globalSizeRule = `size: ${globalLayout.customWidth}mm ${globalLayout.customHeight}mm;`;
    }

    // Headers & footers
    const hf = {
      headerEnabled: resolve("headersFooters.headerEnabled"),
      footerEnabled: resolve("headersFooters.footerEnabled"),
      headerLeft: resolve("headersFooters.headerLeft"),
      headerCenter: resolve("headersFooters.headerCenter"),
      headerRight: resolve("headersFooters.headerRight"),
      footerLeft: resolve("headersFooters.footerLeft"),
      footerCenter: resolve("headersFooters.footerCenter"),
      footerRight: resolve("headersFooters.footerRight"),
      differentOddEven: resolve("headersFooters.differentOddEven"),
      pageNumberFormat: resolve("headersFooters.pageNumberFormat") || "decimal",
      headerFont: resolve("headersFooters.headerFont"),
      headerSize: resolve("headersFooters.headerSize"),
      footerFont: resolve("headersFooters.footerFont"),
      footerSize: resolve("headersFooters.footerSize"),
    };

    const processContent = (text) => {
      if (!text) return '""';
      if (!text.includes("{")) return `"${text}"`;
      const parts = text.split(/({[^}]+})/g);
      const cssParts = parts
        .map((part) => {
          if (part === "{page}") return `counter(page, ${hf.pageNumberFormat})`;
          if (part === "{pages}")
            return `counter(pages, ${hf.pageNumberFormat})`;
          if (part === "{title}") return "string(title)";
          if (part === "{author}") return "string(author)";
          if (part === "{chapterTitle}") return "string(chapterTitle)";
          if (part === "{date}") return "string(date)";
          if (part.match(/^{.*}$/)) return `"${part}"`;
          if (part === "") return null;
          return `"${part}"`;
        })
        .filter(Boolean);
      return cssParts.join(" ");
    };

    const generateMarginBoxes = (isHeader) => {
      let rules = "";
      if (isHeader && !hf.headerEnabled) return "";
      if (!isHeader && !hf.footerEnabled) return "";
      if (isHeader) {
        if (hf.headerLeft)
          rules += `@top-left   { content: ${processContent(hf.headerLeft)};   font-family: ${hf.headerFont}; font-size: ${hf.headerSize}pt; }`;
        if (hf.headerCenter)
          rules += `@top-center { content: ${processContent(hf.headerCenter)}; font-family: ${hf.headerFont}; font-size: ${hf.headerSize}pt; }`;
        if (hf.headerRight)
          rules += `@top-right  { content: ${processContent(hf.headerRight)};  font-family: ${hf.headerFont}; font-size: ${hf.headerSize}pt; }`;
      } else {
        if (hf.footerLeft)
          rules += `@bottom-left   { content: ${processContent(hf.footerLeft)};   font-family: ${hf.footerFont}; font-size: ${hf.footerSize}pt; }`;
        if (hf.footerCenter)
          rules += `@bottom-center { content: ${processContent(hf.footerCenter)}; font-family: ${hf.footerFont}; font-size: ${hf.footerSize}pt; }`;
        if (hf.footerRight)
          rules += `@bottom-right  { content: ${processContent(hf.footerRight)};  font-family: ${hf.footerFont}; font-size: ${hf.footerSize}pt; }`;
      }
      return rules;
    };

    // Global page + base stylesheet
    css += `
      @page {
        ${globalSizeRule}
        margin-top: ${globalLayout.marginTop}mm;
        margin-bottom: ${globalLayout.marginBottom}mm;
        margin-left: ${globalLayout.marginLeft}mm;
        margin-right: ${globalLayout.marginRight}mm;
        background-color: white;
        ${generateMarginBoxes(true)}
        ${generateMarginBoxes(false)}
      }

      /* Running string setup */
      h1 { string-set: chapterTitle content(text); }
      .metadata-title  { string-set: title  content(text); }
      .metadata-author { string-set: author content(text); }
      .metadata-date   { string-set: date   content(text); }

      /* Reset browser heading defaults – our scoped rules take over */
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
      #FormatPreviewContent ul { list-style-type: disc;                                     margin-left: ${resolve("typography.list.listIndent")}pt; }
      #FormatPreviewContent ol { list-style-type: ${resolve("typography.list.orderedListStyle")}; margin-left: ${resolve("typography.list.listIndent")}pt; }

      /* Blockquotes */
      #FormatPreviewContent blockquote {
        margin-left:       ${resolve("typography.blockQuote.indentLeft")}pt;
        margin-right:      ${resolve("typography.blockQuote.indentRight")}pt;
        font-style:        ${resolve("typography.blockQuote.fontStyle")};
        border-left-style: ${resolve("typography.blockQuote.borderLeft.style")};
        border-left-width: ${resolve("typography.blockQuote.borderLeft.width")}px;
        border-left-color: ${resolve("typography.blockQuote.borderLeft.color")};
        padding-left: 10px;
      }

      /* Media safety */
      #FormatPreviewContent img, #FormatPreviewContent video, #FormatPreviewContent svg {
        max-width: 100%;
        height: auto;
      }

      /* Special elements – global because these categories don't vary per-item */
      #FormatPreviewContent [data-category="title_page"] {
        text-align: ${resolve("specialElements.titlePageCentered") ? "center" : "inherit"};
        font-size:  ${resolve("specialElements.titlePageFontSize")}pt;
        ${resolve("layout.isSeparatePage", "title_page") ? `margin-top: ${resolve("specialElements.titlePageSpacing")}pt;` : ""}
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
    `;

    // ─── PART 2: SINGLE ITEM-BY-ITEM PASS ─────────────────────────────────────
    // resolve() already handles the full item > category > global > default chain.
    const firstPaperIndex = sortedData.findIndex((i) => i.type === "paper");

    sortedData.forEach((item, index) => {
      if (item.type !== "paper") return;

      const cat = item.category;
      const id = item.id;

      // ── Layout ──────────────────────────────────────────────────────────────
      const isSeparatePage = resolve("layout.isSeparatePage", cat, id);

      // Named @page for margin overrides when isSeparatePage
      if (isSeparatePage) {
        css += `
          @page item-${id} {
            margin-top:    ${resolve("layout.marginTop", cat, id)}mm;
            margin-bottom: ${resolve("layout.marginBottom", cat, id)}mm;
            margin-left:   ${resolve("layout.marginLeft", cat, id)}mm;
            margin-right:  ${resolve("layout.marginRight", cat, id)}mm;
          }
        `;
      }

      // ── Typography ──────────────────────────────────────────────────────────
      const fontFamily = resolve("typography.fontFamily", cat, id);
      const fontSize = resolve("typography.fontSize", cat, id);
      const lineHeight = resolve("typography.lineHeight", cat, id);
      const alignment = resolve("typography.alignment", cat, id);
      const hyphenation = resolve("typography.hyphenation", cat, id);
      const pSpaceBefore = resolve("typography.pSpaceBefore", cat, id);
      const pSpaceAfter = resolve("typography.pSpaceAfter", cat, id);
      const firstLineIndent = resolve("typography.firstLineIndent", cat, id);
      const firstLineIndentValue = resolve(
        "typography.firstLineIndentValue",
        cat,
        id,
      );

      // ── Advanced (border / background) ──────────────────────────────────────
      const borderStyle = resolve("advanced.borderStyle", cat, id);
      const borderWidth = resolve("advanced.borderWidth", cat, id);
      const borderColor = resolve("advanced.borderColor", cat, id);
      const borderRadius = resolve("advanced.borderRadius", cat, id);
      const bgColor = resolve("advanced.backgroundColor", cat, id);
      const padding = resolve("advanced.padding", cat, id);

      // ── Title format ────────────────────────────────────────────────────────
      const titleSection =
        cat === "chapter" ? "titleFormat" : "normalTitleFormat";
      const titleFontFamily = resolve(`${titleSection}.fontFamily`, cat, id);
      const titleFontSize = resolve(`${titleSection}.fontSize`, cat, id);
      const titleLineHeight = resolve(`${titleSection}.lineHeight`, cat, id);
      const titleSpacingBefore = resolve(
        `${titleSection}.spacingBefore`,
        cat,
        id,
      );
      const titleSpacingAfter = resolve(
        `${titleSection}.spacingAfter`,
        cat,
        id,
      );
      const subtitleItalic = resolve(`${titleSection}.subtitleItalic`, cat, id);
      const subtitleFontFamily = resolve(
        `${titleSection}.subtitleFontFamily`,
        cat,
        id,
      );
      const subtitleFontSize = resolve(
        `${titleSection}.subtitleFontSize`,
        cat,
        id,
      );
      const subtitleLineHeight = resolve(
        `${titleSection}.subtitleLineHeight`,
        cat,
        id,
      );

      const resolvedTitleFont =
        titleFontFamily === "inherit" ? fontFamily : titleFontFamily;
      const resolvedSubtitleFont =
        subtitleFontFamily === "inherit" ? fontFamily : subtitleFontFamily;

      css += `
        /* ── Item: ${id} (${cat}) ── */
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
          break-before:     ${index === firstPaperIndex ? "avoid" : isSeparatePage ? "page" : "auto"} !important;
          ${isSeparatePage ? `break-after: page !important; page: item-${id};` : ""}
        }

        [data-id="${id}"] p {
          margin-top:    ${pSpaceBefore}pt;
          margin-bottom: ${pSpaceAfter}pt;
          text-indent:   ${firstLineIndent ? `${firstLineIndentValue}pt` : "0"};
        }

        [data-id="${id}"] .manuscript-title-block {
          margin-top:    ${titleSpacingBefore}pt;
          margin-bottom: ${titleSpacingAfter}pt;
          text-align:    center;
        }

        [data-id="${id}"] .manuscript-title {
          font-family:  ${resolvedTitleFont};
          font-size:    ${titleFontSize}pt !important;
          line-height:  ${titleLineHeight};
          font-weight:  bold;

        }

        [data-id="${id}"] .manuscript-subtitle {
          font-family: ${resolvedSubtitleFont};
          font-size:   ${subtitleFontSize}pt !important;
          line-height: ${subtitleLineHeight};
          font-style:  ${subtitleItalic ? "italic" : "normal"};
          margin-top:  0.5em;
        }
      `;
    });

    return css;
  }, [getResolvedValue, sortedData]);

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

        const metadataStoreHtml = `
          <div class="metadata-store" style="visibility: hidden; height: 0; overflow: hidden; position: absolute;">
            <div class="metadata-title">${bookTitle}</div>
            <div class="metadata-author">${bookAuthor}</div>
            <div class="metadata-date">${pubDate}</div>
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

          // Get indent spacing value
          const indentSpacing = getResolvedValue(
            "item",
            item.id,
            item.category,
            "layout",
            "indentSpacingValue",
          ).value;

          // Inject manual spaces based on data-indent
          let processedHtml = html.replace(
            /<p([^>]*)data-indent="(\d+)"([^>]*)>/g,
            (match, p1, p2, p3) => {
              const level = parseInt(p2, 10);
              const totalSpaces = level * indentSpacing;
              const spaces = "&nbsp;".repeat(totalSpaces);
              return `<p${p1}data-indent="${p2}"${p3}>${spaces}`;
            },
          );

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

          return `
                <div class="${classes.join(" ")}" 
                     data-category="${item.category}"
                     data-id="${item.id}">
                    ${isFirstPaper ? metadataStoreHtml : ""}
                    ${titleBlock}
                    ${processedHtml}
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
      className="w-full h-full relative overflow-y-auto bg-gray-100 flex flex-col items-center p-4 overflow-x-hidden"
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
