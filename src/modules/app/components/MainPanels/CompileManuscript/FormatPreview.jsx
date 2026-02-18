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
      differentFirstPage: resolve("headersFooters.differentFirstPage"),
      differentOddEven: resolve("headersFooters.differentOddEven"),
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
          if (part === "{pageNumber}") return "counter(page)";
          if (part === "{totalPages}") return "counter(pages)";
          if (part === "{title}") return "string(title)"; // Requires string-set: title content(text)
          if (part === "{author}") return "string(author)";
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
    `;

    // Different First Page
    if (hf.differentFirstPage) {
      css += `
        @page:first {
          /* Often first page has no header/footer or different ones. 
             For now, we assume "different" implies clearing them unless specified otherwise? 
             Or does formatConstants have specific first page settings? 
             It doesn't seem to have explicit "firstPageHeaderLeft". 
             So usually "Different First Page" means NO header/footer on first page. */
          @top-left { content: none; }
          @top-center { content: none; }
          @top-right { content: none; }
          @bottom-left { content: none; }
          @bottom-center { content: none; }
          @bottom-right { content: none; }
        }
      `;
    }

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
          margin-top: ${resolve("specialElements.titlePageSpacing")}pt; /* Approx vertical center or spacing */
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

      /* Page Break Utilities */
      .break-before-auto { break-before: auto !important; page-break-before: auto !important; }
      .break-before-page { break-before: page !important; page-break-before: always !important; }
      .break-before-left { break-before: left !important; page-break-before: left !important; }
      .break-before-right { break-before: right !important; page-break-before: right !important; }

      .break-after-auto { break-after: auto !important; page-break-after: auto !important; }
      .break-after-page { break-after: page !important; page-break-after: always !important; }
      .break-after-left { break-after: left !important; page-break-after: left !important; }
      .break-after-right { break-after: right !important; page-break-after: right !important; }
      .break-after-avoid { break-after: avoid !important; page-break-after: avoid !important; }
    `;

    // 2. CATEGORY-SPECIFIC STYLES
    if (formatData.category) {
      Object.keys(formatData.category).forEach((category) => {
        // Layout Overrides (Named Page)
        const tLayout = {
          marginTop: resolve("layout.marginTop", category),
          marginBottom: resolve("layout.marginBottom", category),
          marginLeft: resolve("layout.marginLeft", category),
          marginRight: resolve("layout.marginRight", category),
          pageSize: resolve("layout.pageSize", category),
          customWidth: resolve("layout.customWidth", category),
          customHeight: resolve("layout.customHeight", category),
          orientation: resolve("layout.orientation", category),
        };

        // We always generate named page for categories that have an entry to ensure specific styles apply
        let tSizeRule = `size: ${tLayout.pageSize} ${tLayout.orientation};`;
        if (tLayout.pageSize === "CUSTOM") {
          tSizeRule = `size: ${tLayout.customWidth}mm ${tLayout.customHeight}mm;`;
        }

        css += `
          @page category-${category} {
            ${tSizeRule}
            margin-top: ${tLayout.marginTop}mm;
            margin-bottom: ${tLayout.marginBottom}mm;
            margin-left: ${tLayout.marginLeft}mm;
            margin-right: ${tLayout.marginRight}mm;
          }
        `;

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
          #FormatPreviewContent [data-category="${category}"] {
             font-family: ${tTypography.fontFamily};
             font-size: ${tTypography.fontSize}pt;
             line-height: ${tTypography.lineHeight};
             text-align: ${tTypography.alignment};
          }
          #FormatPreviewContent [data-category="${category}"] p {
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

        // Layout
        const iLayout = {
          marginTop: resolve("layout.marginTop", category, itemId),
          marginBottom: resolve("layout.marginBottom", category, itemId),
          marginLeft: resolve("layout.marginLeft", category, itemId),
          marginRight: resolve("layout.marginRight", category, itemId),
          pageSize: resolve("layout.pageSize", category, itemId),
          customWidth: resolve("layout.customWidth", category, itemId),
          customHeight: resolve("layout.customHeight", category, itemId),
          orientation: resolve("layout.orientation", category, itemId),
        };

        let iSizeRule = `size: ${iLayout.pageSize} ${iLayout.orientation};`;
        if (iLayout.pageSize === "CUSTOM") {
          iSizeRule = `size: ${iLayout.customWidth}mm ${iLayout.customHeight}mm;`;
        }

        css += `
             @page item-${itemId} {
               ${iSizeRule}
               margin-top: ${iLayout.marginTop}mm;
               margin-bottom: ${iLayout.marginBottom}mm;
               margin-left: ${iLayout.marginLeft}mm;
               margin-right: ${iLayout.marginRight}mm;
             }
           `;

        // Typography
        const iTypography = {
          fontFamily: resolve("typography.fontFamily", category, itemId),
          fontSize: resolve("typography.fontSize", category, itemId),
          lineHeight: resolve("typography.lineHeight", category, itemId),
          alignment: resolve("typography.alignment", category, itemId),
          pSpaceBefore: resolve(
            "typography.paragraphSpaceBefore",
            category,
            itemId,
          ),
          pSpaceAfter: resolve(
            "typography.paragraphSpaceAfter",
            category,
            itemId,
          ),
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

        css += `
             #FormatPreviewContent [data-id="${itemId}"] {
                font-family: ${iTypography.fontFamily};
                font-size: ${iTypography.fontSize}pt;
                line-height: ${iTypography.lineHeight};
                text-align: ${iTypography.alignment};
             }
             #FormatPreviewContent [data-id="${itemId}"] p {
                margin-top: ${iTypography.pSpaceBefore}pt;
                margin-bottom: ${iTypography.pSpaceAfter}pt;
                text-indent: ${iTypography.firstLineIndent ? `${iTypography.firstLineIndentValue}pt` : "0"};
             }
           `;
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

        const firstPaperIndex = sortedData.findIndex(
          (item) => item.type === "paper",
        );

        const itemPromises = sortedData.map(async (item, index) => {
          if (item.type !== "paper") return null;

          // Resolve page breaks
          const breakBeforeVal = getResolvedValue(
            "item",
            item.id,
            item.category,
            "sectionBreaks",
            "pageBreakBefore",
          ).value;

          const breakAfterVal = getResolvedValue(
            "item",
            item.id,
            item.category,
            "sectionBreaks",
            "pageBreakAfter",
          ).value;

          let classes = [
            `manuscript-item section-${item.section} category-${item.category}`,
          ];

          // Handle Break Before (Default to page if auto/undefined)
          // Exception: First item shouldn't break page
          if (index === firstPaperIndex) {
            classes.push("break-before-auto");
          } else if (breakBeforeVal === "none") {
            classes.push("break-before-auto");
          } else if (breakBeforeVal === "odd") {
            classes.push("break-before-right");
          } else if (breakBeforeVal === "even") {
            classes.push("break-before-left");
          }
          // Handle Break After
          if (breakAfterVal === "always") {
            classes.push("break-after-page");
          } else if (breakAfterVal === "odd") {
            classes.push("break-after-right");
          } else if (breakAfterVal === "even") {
            classes.push("break-after-left");
          } else if (breakAfterVal === "avoid") {
            classes.push("break-after-avoid");
          }

          const html = await dataManagerSubdocs.getHtmlFromPaper(
            libraryYTree,
            item.sourceId,
          );

          // Determine Named Page
          let namedPage = null;
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

          let styleAttr = namedPage ? `style="page: ${namedPage};"` : "";

          return `
                <div class="${classes.join(" ")}" 
                     data-category="${item.category}"
                     data-id="${item.id}"
                     ${styleAttr}>
                    ${html}
                </div>
            `;
        });

        const results = await Promise.all(itemPromises);

        if (active) {
          // const css = generateCss(); // Moved to render effect
          const fullHtml = `
              
                    ${results.filter(Boolean).join("")}
              
            `;
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

    const render = async () => {
      containerRef.current.innerHTML = "";

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
