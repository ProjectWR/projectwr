import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { generatePagedJsCSS } from "../utils/formatUtils";
import { Previewer } from 'pagedjs';

const FormatPreview = ({ pages, effectiveSettings, selectedPageId }) => {
  const previewRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderPreview = async () => {
      if (!previewRef.current || !effectiveSettings) return;

      setIsRendering(true);
      setError(null);

      try {
        // Generate CSS from settings
        const customCSS = generatePagedJsCSS(effectiveSettings);

        // Find the page to preview
        let pageToPreview = pages[0];
        if (selectedPageId) {
          const found = pages.find((p) => p.id === selectedPageId);
          if (found) pageToPreview = found;
        }

        // Create HTML content
        const htmlContent = `
          <html>
            <head>
              <style>
                ${customCSS}
              </style>
            </head>
            <body>
              <div class="content">
                ${pageToPreview?.content || "<p>No content to preview</p>"}
              </div>
            </body>
          </html>
        `;

        // Clear previous content
        previewRef.current.innerHTML = "";

        // Create a temporary container
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = htmlContent;

        // Initialize Paged.js previewer
        const paged = new Previewer();
        await paged.preview(
          tempContainer.querySelector("body").innerHTML,
          [customCSS],
          previewRef.current,
        );

        setIsRendering(false);
      } catch (err) {
        console.error("Preview rendering error:", err);
        setError("Failed to render preview");
        setIsRendering(false);
      }
    };

    renderPreview();
  }, [pages, effectiveSettings, selectedPageId]);

  return (
    <div className="w-full h-full flex flex-col bg-appLayoutBackground overflow-hidden">
      <div className="w-full px-3 py-2 border-b border-appLayoutBorder flex items-center justify-between">
        <h3 className="text-libraryDirectoryBookNodeFontSize font-medium text-appLayoutText">
          Preview
        </h3>
        {isRendering && (
          <span className="text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
            Rendering...
          </span>
        )}
      </div>

      <div className="w-full flex-1 overflow-auto bg-appLayoutInputBg p-4">
        {error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div
            ref={previewRef}
            className="w-full h-full"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          />
        )}
      </div>
    </div>
  );
};

FormatPreview.propTypes = {
  pages: PropTypes.array.isRequired,
  effectiveSettings: PropTypes.object.isRequired,
  selectedPageId: PropTypes.string,
};

export default FormatPreview;
