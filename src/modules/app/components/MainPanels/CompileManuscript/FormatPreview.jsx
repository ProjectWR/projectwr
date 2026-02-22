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
  // Generators for CSS
  const generateCss = useCallback(() => {
    let css = "";

    // Helper to get a resolved value for a specific scope
    const resolve = (path, category = null, id = null) => {
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

      return getResolvedValue(
        scope,
        targetId,
        targetCategory,
        path.split(".")[0],
        path.split(".")[1],
      ).value;
    };

    // 1. GLOBAL STYLES
    const globalLayout = {
      marginTop: resolve("layout.marginTop"),
      marginBottom: resolve("layout.marginBottom"),
      marginLeft: resolve("layout.marginLeft"),
      marginRight: resolve("layout.marginRight"),
      pageSize: resolve("layout.pageSize"),
      customWidth: resolve("layout.customWidth"),
      customHeight: resolve("layout.customHeight"),
      orientation: resolve("layout.orientation"),
      indentSpacingValue: resolve("layout.indentSpacingValue"),
    };

    const globalTypography = {
      fontFamily: resolve("typography.fontFamily"),
      fontSize: resolve("typography.fontSize"),
      lineHeight: resolve("typography.lineHeight"),
      alignment: resolve("typography.alignment"),
      hyphenation: resolve("typography.hyphenation"),
      pSpaceBefore: resolve("typography.paragraphSpaceBefore"),
      pSpaceAfter: resolve("typography.paragraphSpaceAfter"),
      firstLineIndent: resolve("typography.firstLineIndent"),
      firstLineIndentValue: resolve("typography.firstLineIndentValue"),
    };

    let globalSizeRule = `size: ${globalLayout.pageSize} ${globalLayout.orientation};`;
    if (globalLayout.pageSize === "CUSTOM") {
      globalSizeRule = `size: ${globalLayout.customWidth}mm ${globalLayout.customHeight}mm;`;
    }

    // Headers & Footers Helper
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
      headerFont: resolve("headersFooters.headerFontFamily"),
      headerSize: resolve("headersFooters.headerFontSize"),
      footerFont: resolve("headersFooters.footerFontFamily"),
      footerSize: resolve("headersFooters.footerFontSize"),
    };

    const processContent = (text) => {
      if (!text) return '""';

      // Fast path: if no variables, quote it.
      if (!text.includes("{")) return `"${text}"`;

      // Handle simple mixed content: "Page {pageNumber} of {totalPages}"
      const parts = text.split(/({[^}]+})/g);
      const cssParts = parts
        .map((part) => {
          if (part === "{pageNumber}")
            return `counter(page, ${hf.pageNumberFormat})`;
          if (part === "{totalPages}")
            return `counter(pages, ${hf.pageNumberFormat})`;
          if (part === "{title}") return "string(title)";
          if (part === "{author}") return "string(author)";
          if (part === "{chapterTitle}") return "string(chapterTitle)";
          if (part === "{date}") return "string(date)";
          if (part.match(/^{.*}$/)) return `"${part}"`; // Unknown variable
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

      // Headers
      if (isHeader) {
        if (hf.headerLeft)
          rules += `@top-left { content: ${processContent(hf.headerLeft)}; font-family: ${hf.headerFont}; font-size: ${hf.headerSize}pt; }`;
        if (hf.headerCenter)
          rules += `@top-center { content: ${processContent(hf.headerCenter)}; font-family: ${hf.headerFont}; font-size: ${hf.headerSize}pt; }`;
        if (hf.headerRight)
          rules += `@top-right { content: ${processContent(hf.headerRight)}; font-family: ${hf.headerFont}; font-size: ${hf.headerSize}pt; }`;
      }
      // Footers
      if (!isHeader) {
        if (hf.footerLeft)
          rules += `@bottom-left { content: ${processContent(hf.footerLeft)}; font-family: ${hf.footerFont}; font-size: ${hf.footerSize}pt; }`;
        if (hf.footerCenter)
          rules += `@bottom-center { content: ${processContent(hf.footerCenter)}; font-family: ${hf.footerFont}; font-size: ${hf.footerSize}pt; }`;
        if (hf.footerRight)
          rules += `@bottom-right { content: ${processContent(hf.footerRight)}; font-family: ${hf.footerFont}; font-size: ${hf.footerSize}pt; }`;
      }
      return rules;
    };

    // Base Page Rule
    css += `
      @page {
        ${globalSizeRule}
        margin-top: ${globalLayout.marginTop}mm;
        margin-bottom: ${globalLayout.marginBottom}mm;
        margin-left: ${globalLayout.marginLeft}mm;
        margin-right: ${globalLayout.marginRight}mm;
        background-color: white;

        /* Default Headers/Footers */
        ${generateMarginBoxes(true)}
        ${generateMarginBoxes(false)}
      }

      /* Running Headers Setup */
      h1 { string-set: chapterTitle content(text); }
      .metadata-title { string-set: title content(text); }
      .metadata-author { string-set: author content(text); }
      .metadata-date { string-set: date content(text); }
    `;

    // Different Odd/Even (Left/Right)
    if (hf.differentOddEven) {
      // Logic: Usually this mirrors margins or swaps content.
      // If formatConstants had "headerLeftOdd" vs "headerLeftEven", we'd use that.
      // Current formatConstants only has generic.
      // Standard behavior: content might mirror?
      // Without explicit config, we basically proceed with standard,
      // but maybe margins mirror if using "facing pages" logic (not fully in config yet).
      // We'll leave this placeholder or basic mirror logic if needed.
      // For now, PagedJS handles left/right page classes, but @page:left/@page:right need explicit rules.
    }

    css += `
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
      
      .manuscript-item {
        color: black;
      }
      
      /* Lists */
      #FormatPreviewContent ul { list-style-type: disc; margin-left: ${resolve("typography.list.listIndent")}pt; }
      #FormatPreviewContent ol { list-style-type: ${resolve("typography.list.orderedListStyle")}; margin-left: ${resolve("typography.list.listIndent")}pt; }
      
      /* Blockquotes */
      #FormatPreviewContent blockquote {
        margin-left: ${resolve("typography.blockQuote.indentLeft")}pt;
        margin-right: ${resolve("typography.blockQuote.indentRight")}pt;
        font-style: ${resolve("typography.blockQuote.fontStyle")};
        border-left-style: ${resolve("typography.blockQuote.borderLeft.style")};
        border-left-width: ${resolve("typography.blockQuote.borderLeft.width")}px;
        border-left-color: ${resolve("typography.blockQuote.borderLeft.color")};
        padding-left: 10px;
      }

      /* Image safety */
      #FormatPreviewContent img, #FormatPreviewContent video, #FormatPreviewContent svg {
        max-width: 100%;
        height: auto;
      }

      /* Special Elements logic for Types */
      /* Title Page */
      #FormatPreviewContent [data-category="title_page"] {
          text-align: ${resolve("specialElements.titlePageCentered") ? "center" : "inherit"};
          font-size: ${resolve("specialElements.titlePageFontSize")}pt;
          ${resolve("layout.isSeparatePage", "title_page") ? `margin-top: ${resolve("specialElements.titlePageSpacing")}pt;` : ""}
      }
      /* Part Divider */
      #FormatPreviewContent [data-category="part_divider"] {
          text-align: ${resolve("specialElements.partDividerCentered") ? "center" : "inherit"};
          font-size: ${resolve("specialElements.partDividerFontSize")}pt;
      }
      /* Epigraph */
      #FormatPreviewContent [data-category="epigraph"] {
          font-style: ${resolve("specialElements.epigraphItalic") ? "italic" : "normal"};
          text-align: ${resolve("specialElements.epigraphAlignment")};
          font-size: ${resolve("specialElements.epigraphFontSize")}pt;
      }

      /* Page Break Utilities removed - handled by dynamic CSS */
    `;

    // 2. ITEM BREAK STYLES
    const firstPaperIndex = sortedData.findIndex(
      (item) => item.type === "paper",
    );

    sortedData.forEach((item, index) => {
      if (item.type !== "paper") return;

      const isSeparatePage = resolve(
        "layout.isSeparatePage",
        item.category,
        item.id,
      );

      let breakRules = "";

      // Handle Break Before
      if (index === firstPaperIndex) {
        breakRules += "break-before: auto !important;";
      } else if (isSeparatePage) {
        breakRules += "break-before: page !important;";
      } else {
        breakRules += "break-before: auto !important;";
      }

      // Handle Break After
      if (isSeparatePage) {
        breakRules += "break-after: page !important;";
      } else {
        // No explicit break after if not a separate page
      }

      if (breakRules) {
        css += `
          [data-id="${item.id}"] {
            ${breakRules}
          }
        `;
      }
    });

    // 3. CATEGORY-SPECIFIC STYLES
    if (formatData.category) {
      Object.keys(formatData.category).forEach((category) => {
        // Layout Overrides (Named Page)
        const isSeparatePage = resolve("layout.isSeparatePage", category);
        if (isSeparatePage) {
          const tLayout = {
            marginTop: resolve("layout.marginTop", category),
            marginBottom: resolve("layout.marginBottom", category),
            marginLeft: resolve("layout.marginLeft", category),
            marginRight: resolve("layout.marginRight", category),
          };

          css += `
            @page category-${category} {
              margin-top: ${tLayout.marginTop}mm;
              margin-bottom: ${tLayout.marginBottom}mm;
              margin-left: ${tLayout.marginLeft}mm;
              margin-right: ${tLayout.marginRight}mm;
            }
          `;
        }

        // Typography Overrides (Class)
        const tTypography = {
          fontFamily: resolve("typography.fontFamily", category),
          fontSize: resolve("typography.fontSize", category),
          lineHeight: resolve("typography.lineHeight", category),
          alignment: resolve("typography.alignment", category),
          pSpaceBefore: resolve("typography.paragraphSpaceBefore", category),
          pSpaceAfter: resolve("typography.paragraphSpaceAfter", category),
          firstLineIndent: resolve("typography.firstLineIndent", category),
          firstLineIndentValue: resolve(
            "typography.firstLineIndentValue",
            category,
          ),
        };

        css += `
          .manuscript-item [data-category="${category}"] {
             font-family: ${tTypography.fontFamily};
             font-size: ${tTypography.fontSize}pt;
             line-height: ${tTypography.lineHeight};
             text-align: ${tTypography.alignment};
          }
          .manuscript-item [data-category="${category}"] p {
             margin-top: ${tTypography.pSpaceBefore}pt;
             margin-bottom: ${tTypography.pSpaceAfter}pt;
             text-indent: ${tTypography.firstLineIndent ? `${tTypography.firstLineIndentValue}pt` : "0"};
          }
        `;
      });
    }

    // 3. ITEM-SPECIFIC STYLES
    if (formatData.item) {
      Object.keys(formatData.item).forEach((itemId) => {
        // Find category for this item to allow getResolvedValue to work its fallback magic
        const item = sortedData.find((i) => i.id === itemId);
        const category = item ? item.category : null;

        const isSeparatePage = resolve(
          "layout.isSeparatePage",
          category,
          itemId,
        );

        // Layout
        if (isSeparatePage) {
          const iLayout = {
            marginTop: resolve("layout.marginTop", category, itemId),
            marginBottom: resolve("layout.marginBottom", category, itemId),
            marginLeft: resolve("layout.marginLeft", category, itemId),
            marginRight: resolve("layout.marginRight", category, itemId),
          };

          css += `
               @page item-${itemId} {
                 margin-top: ${iLayout.marginTop}mm;
                 margin-bottom: ${iLayout.marginBottom}mm;
                 margin-left: ${iLayout.marginLeft}mm;
                 margin-right: ${iLayout.marginRight}mm;
               }
             `;
        }

        // Typography
        const iTypography = {
          fontFamily: resolve("typography.fontFamily", category, itemId),
          fontSize: resolve("typography.fontSize", category, itemId),
          lineHeight: resolve("typography.lineHeight", category, itemId),
          alignment: resolve("typography.alignment", category, itemId),
          pSpaceBefore: resolve("typography.pSpaceBefore", category, itemId),
          pSpaceAfter: resolve("typography.pSpaceAfter", category, itemId),
          firstLineIndent: resolve(
            "typography.firstLineIndent",
            category,
            itemId,
          ),
          firstLineIndentValue: resolve(
            "typography.firstLineIndentValue",
            category,
            itemId,
          ),
        };

        // Title Block Typography & Spacing
        const titleSection =
          category === "chapter" ? "titleFormat" : "normalTitleFormat";
        const tTypography = {
          fontFamily: resolve(`${titleSection}.fontFamily`, category, itemId),
          fontSize: resolve(`${titleSection}.fontSize`, category, itemId),
          lineHeight: resolve(`${titleSection}.lineHeight`, category, itemId),
          spacingBefore: resolve(
            `${titleSection}.spacingBefore`,
            category,
            itemId,
          ),
          spacingAfter: resolve(
            `${titleSection}.spacingAfter`,
            category,
            itemId,
          ),
          subtitleItalic: resolve(
            `${titleSection}.subtitleItalic`,
            category,
            itemId,
          ),
          subtitleFontFamily: resolve(
            `${titleSection}.subtitleFontFamily`,
            category,
            itemId,
          ),
          subtitleFontSize: resolve(
            `${titleSection}.subtitleFontSize`,
            category,
            itemId,
          ),
          subtitleLineHeight: resolve(
            `${titleSection}.subtitleLineHeight`,
            category,
            itemId,
          ),
        };

        css += `
             [data-id="${itemId}"] {
                font-family: ${iTypography.fontFamily};
                font-size: ${iTypography.fontSize}pt;
                line-height: ${iTypography.lineHeight};
                text-align: ${iTypography.alignment};
             }
             [data-id="${itemId}"] p {
                margin-top: ${iTypography.pSpaceBefore}pt;
                margin-bottom: ${iTypography.pSpaceAfter}pt;
                text-indent: ${iTypography.firstLineIndent ? `${iTypography.firstLineIndentValue}pt` : "0"};
             }
             [data-id="${itemId}"] .manuscript-title-block {
                margin-top: ${tTypography.spacingBefore}pt;
                margin-bottom: ${tTypography.spacingAfter}pt;
                text-align: center;
             }
             [data-id="${itemId}"] .manuscript-title {
                font-family: ${tTypography.fontFamily === "inherit" ? iTypography.fontFamily : tTypography.fontFamily};
                font-size: ${tTypography.fontSize}pt !important;
                line-height: ${tTypography.lineHeight};
                font-weight: bold;
             }
             [data-id="${itemId}"] .manuscript-subtitle {
                font-family: ${tTypography.subtitleFontFamily === "inherit" ? iTypography.fontFamily : tTypography.subtitleFontFamily};
                font-size: ${tTypography.subtitleFontSize}pt !important;
                line-height: ${tTypography.subtitleLineHeight};
                font-style: ${tTypography.subtitleItalic ? "italic" : "normal"};
                margin-top: 0.5em;
             }
           `;

        console.log("Generated CSS for item:", itemId, css);
      });
    }

    return css;
  }, [getResolvedValue, formatData, sortedData]);

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

        const itemPromises = sortedData.map(async (item) => {
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

          // Determine Named Page
          let namedPage = null;
          const isSeparatePage = getResolvedValue(
            "item",
            item.id,
            item.category,
            "layout",
            "isSeparatePage",
          ).value;

          if (isSeparatePage) {
            if (
              formatData.item &&
              formatData.item[item.id] &&
              formatData.item[item.id].layout
            ) {
              namedPage = `item-${item.id}`;
            } else if (
              formatData.category &&
              formatData.category[item.category] &&
              formatData.category[item.category].layout
            ) {
              namedPage = `category-${item.category}`;
            }
          }

          let styleAttr = namedPage ? `style="page: ${namedPage};"` : "";

          return `
                <div class="${classes.join(" ")}" 
                     data-category="${item.category}"
                     data-id="${item.id}"
                     ${styleAttr}>
                    ${titleBlock}
                    ${processedHtml}
                </div>
            `;
        });

        const results = await Promise.all(itemPromises);

        if (active) {
          const metadata = formatData?.global?.metadata || {};
          const bookTitle = metadata.title?.text || "";
          const bookAuthor = metadata.creator?.text || "";
          const pubDate = metadata.publication?.date || "";

          const fullHtml = `
              <div class="pagedjs-content">
                    <div class="metadata-store" style="visibility: hidden; height: 0; overflow: hidden; position: absolute;">
                      <div class="metadata-title">${bookTitle}</div>
                      <div class="metadata-author">${bookAuthor}</div>
                      <div class="metadata-date">${pubDate}</div>
                    </div>
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
