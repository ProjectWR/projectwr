import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import BinderView from "./BinderView";
import ManuscriptView from "./ManuscriptView";
import OrganizeView from "./OrganizeView";
import { load } from "@tauri-apps/plugin-store";
import { appStore } from "../../../stores/appStore";
import DetailsPanel, {
  formClassName,
} from "../../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import { DetailsPanelNameLabel } from "../../LayoutComponents/DetailsPanel/DetailsPanelNameInput";
import {
  DetailsPanelBody,
  DetailsPanelProperties,
} from "../../LayoutComponents/DetailsPanel/DetailsPanelBody";
import FormatView from "./FormatView";

const CompileManuscriptPanel = () => {
  const [store, setStore] = useState(null);
  const [manuscriptData, setManuscriptData] = useState([]);

  const [stage, setStage] = useState("select_content");

  const libraryId = appStore((state) => state.libraryId);

  useEffect(() => {
    const initStore = async () => {
      const newStore = await load(`compile_manuscript_${libraryId}.json`);
      setStore(newStore);

      const savedData = await newStore.get("manuscript");
      if (savedData) {
        setManuscriptData(savedData);
      }
    };
    initStore();
  }, [libraryId]);

  const handleSave = async (newData) => {
    if (store) {
      await store.set("manuscript", newData);
      await store.save();
      setManuscriptData(newData);
    }
  };

  const addItemsToManuscript = (items) => {
    // Append new items to the end of the list
    // If items are an array, spread them
    const newItems = Array.isArray(items) ? items : [items];
    const newData = [...manuscriptData, ...newItems];

    setManuscriptData(newData);
    if (store) {
      store.set("manuscript", newData);
      store.save();
    }
  };

  const handleClearPersistence = async () => {
    if (
      confirm(
        "Are you sure you want to completely clear the saved compilation data? This will reset everything to default.",
      )
    ) {
      if (store) {
        await store.clear();
        await store.save();
      }
      setManuscriptData([]);
      setStore(null);
      // Reload the store to ensure clean state
      const newStore = await load(`compile_manuscript_${libraryId}.json`);
      setStore(newStore);
      setStage("select_content");
    }
  };

  // Auto-assign types when transitioning to organize stage
  const handleStageChange = (newStage) => {
    setStage(newStage);
  };

  return (
    <DetailsPanel>
      <div id="CompileManuscriptContent" className={formClassName}>
        <DetailsPanelHeader>
          <DetailsPanelNameLabel>Compile Manuscript</DetailsPanelNameLabel>
        </DetailsPanelHeader>
        <DetailsPanelBody>
          <DetailsPanelProperties>
            <div className="flex items-center gap-2 text-libraryDirectoryBookNodeFontSize border rounded-md border-appLayoutBorder p-1">
              <button
                onClick={() => handleStageChange("select_content")}
                className={`${stage === "select_content" ? "text-appLayoutText bg-appLayoutHover" : "text-appLayoutTextMuted hover:text-appLayoutText hover:bg-appLayoutHover"} px-3 py-1  rounded-md cursor-pointer transition-colors duration-100`}
              >
                Select Content
              </button>
              <span className="icon-[formkit--right] h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted"></span>
              <button
                onClick={() => handleStageChange("organize")}
                className={`${stage === "organize" ? "text-appLayoutText bg-appLayoutHover" : "text-appLayoutTextMuted hover:text-appLayoutText hover:bg-appLayoutHover"} px-3 py-1  rounded-md cursor-pointer transition-colors duration-100`}
              >
                Organize
              </button>
              <span className="icon-[formkit--right] h-libraryDirectoryBookNodeIconSize w-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted"></span>

              <button
                onClick={() => handleStageChange("format")}
                className={`${stage === "format" ? "text-appLayoutText bg-appLayoutHover" : "text-appLayoutTextMuted hover:text-appLayoutText hover:bg-appLayoutHover"} px-3 py-1  rounded-md cursor-pointer transition-colors duration-100`}
              >
                Format
              </button>
            </div>

            <div className="w-full grow flex flex-col lg:flex-row gap-4">
              {stage === "select_content" && (
                <>
                  {/* Binder View (Source) */}
                  <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="w-full px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
                      <h3 className="w-fit px-2 flex justify-start items-center   text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
                        Binder
                      </h3>
                      <div className="divider w-full px-1">
                        <div className="w-full h-px bg-appLayoutBorder"></div>
                      </div>
                      <div className="flex w-full overflow-auto">
                        <BinderView
                          libraryId={libraryId}
                          onAdd={addItemsToManuscript}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Manuscript View (Destination) */}
                  <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="w-full  px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
                      <div className="flex items-center gap-1">
                        <h3 className="w-fit min-h-fit px-1 flex justify-start items-center text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
                          Manuscript Content
                        </h3>
                        <button
                          onClick={handleClearPersistence}
                          className="px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                          title="Clear all persistence"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="divider w-full px-1">
                        <div className="w-full h-px bg-appLayoutBorder"></div>
                      </div>
                      <div className="flex w-full overflow-auto">
                        <ManuscriptView
                          data={manuscriptData}
                          onUpdate={handleSave}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {stage === "organize" && (
                <OrganizeView
                  handleSave={handleSave}
                  manuscriptData={manuscriptData}
                />
              )}

              {stage === "format" && <FormatView />}
            </div>

            {(stage === "select_content" ||
              stage === "organize" ||
              stage === "format") && (
                <div className="flex items-center w-full px-2 justify-end text-libraryDirectoryBookNodeFontSize ">
                  <button
                    onClick={() => {
                      if (stage === "select_content") {
                        handleStageChange("organize");
                      } else if (stage === "organize") {
                        handleStageChange("format");
                      } else if (stage === "format") {
                        // create publishing package .zip and save to system
                      }
                    }}
                    className="flex items-center gap-2 pl-3 pr-2 py-1 w-fit h-fit rounded-md cursor-pointer transition-colors duration-100 hover:bg-appLayoutHover hover:text-appLayoutText border border-appLayoutBorder"
                  >
                    I am done with{" "}
                    {stage === "select_content"
                      ? "selecting"
                      : stage === "organize"
                        ? "organizing"
                        : stage === "format"
                          ? "formatting"
                          : ""}
                    <span className="icon-[ep--right] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
                  </button>
                </div>
              )}
          </DetailsPanelProperties>
        </DetailsPanelBody>
      </div>
    </DetailsPanel>
  );
};

export default CompileManuscriptPanel;

CompileManuscriptPanel.propTypes = {
  libraryId: PropTypes.string.isRequired,
};
