import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { load } from "@tauri-apps/plugin-store";
import FormatEditor from "./FormatEditor";
import FormatPreview from "./FormatPreview";

const FormatView = ({ manuscriptData, libraryId }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceTimerRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!libraryId) return;

    let unlisten = null;

    const setupObserver = async () => {
      try {
        const store = await load(`compile_manuscript_${libraryId}.json`);

        // onKeyChange returns an unlisten function
        unlisten = await store.onKeyChange("formatData", () => {
          console.log("Store change detected for formatData. Debouncing...");

          setRefreshing(true);

          // Clear existing timer (True Debounce)
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // Set new timer
          debounceTimerRef.current = setTimeout(() => {
            console.log("Debounce timeout complete. Remounting Preview...");
            setRefreshKey((prev) => prev + 1);
            setRefreshing(false)
            debounceTimerRef.current = null;
          }, 5000);
        });

        console.log("Format store observer active.");
      } catch (err) {
        console.error("Failed to setup store observer:", err);
      }
    };

    setupObserver();

    return () => {
      if (typeof unlisten === "function") {
        unlisten();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [libraryId]);

  return (
    <div
      id="FormatViewContainer"
      className="grow min-h-0 overflow-hidden w-full basis-0 flex gap-2 border border-appLayoutBorder rounded-lg p-2"
    >
      <div id="FormatEditorContainer" className="w-1/3 h-full max-h-full">
        <FormatEditor manuscriptData={manuscriptData} libraryId={libraryId} />
      </div>

      <div className="h-full w-px bg-appLayoutBorder"></div>

      <div
        id="FormatViewPreviewContainer"
        className="h-full grow min-w-0 basis-0 bg-neutral-800 rounded-lg overflow-hidden relative"
      >

        {refreshing && (
          <div id="PreviewLoadingIndicator" className="absolute flex items-center justify-center rounded-md pointer-events-none h-fit w-fit p-1 top-[2px] right-[13px] bg-appBackgroundAccent/80 backdrop-blur-md  z-30">
            <span className="icon-[line-md--loading-twotone-loop] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
          </div>
        )}

        <FormatPreview
          key={refreshKey}
          manuscriptData={manuscriptData}
          libraryId={libraryId}
        />


      </div>
    </div>
  );
};

FormatView.propTypes = {
  manuscriptData: PropTypes.array,
  libraryId: PropTypes.string,
};

export default FormatView;
