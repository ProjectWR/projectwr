import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import BinderView from "./BinderView";
import ManuscriptView from "./ManuscriptView";
import OrganizeView from "./OrganizeView";
import { autoAssignType } from "./organizeConstants";
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

const CompileManuscriptPanel = () => {
  const [store, setStore] = useState(null);
  const [manuscriptData, setManuscriptData] = useState([]);
  const [compileConfig, setCompileConfig] = useState([]);

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

      const savedConfig = await newStore.get("compileConfig");
      if (savedConfig) {
        setCompileConfig(savedConfig);
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

  // Auto-assign types when transitioning to organize stage
  const handleStageChange = (newStage) => {
    if (newStage === "organize") {
      let newConfig = [...compileConfig];

      if (newConfig.length === 0) {
        // Auto-assign types for all manuscript items
        newConfig = manuscriptData.map((item, index) => {
          const assignment = autoAssignType(item.title);
          return {
            nodeId: item.id,
            type: assignment.type,
            section: assignment.section,
            order: index,
          };
        });
      }

      // Ensure mandatory "Title Page" is present
      if (!newConfig.find((c) => c.type === "title_page")) {
        newConfig.unshift({
          nodeId: "virtual:title-page",
          type: "title_page",
          section: "front",
          order: -1, // Will be re-indexed below
        });
      }

      // Re-index all items to ensure clean order numbers
      const sections = ["front", "body", "back"];
      sections.forEach((s) => {
        const sectionItems = newConfig.filter((c) => c.section === s);
        sectionItems
          .sort((a, b) => a.order - b.order)
          .forEach((item, idx) => {
            item.order = idx;
          });
      });

      setCompileConfig(newConfig);
      if (store) {
        store.set("compileConfig", newConfig);
        store.save();
      }
    }
    setStage(newStage);
  };

  const handleAddVirtualItem = (type, section) => {
    const newConfig = [...compileConfig];
    const sectionItems = newConfig.filter((c) => c.section === section);

    newConfig.push({
      nodeId: `virtual:${type}-${Date.now()}`,
      type: type,
      section: section,
      order: sectionItems.length,
    });

    setCompileConfig(newConfig);
    if (store) {
      store.set("compileConfig", newConfig);
      store.save();
    }
  };

  // Update compile config for a specific item
  const handleUpdateConfig = (nodeId, updates) => {
    let newConfig = [...compileConfig];

    // Find the item being updated
    const itemIndex = newConfig.findIndex((c) => c.nodeId === nodeId);
    if (itemIndex === -1) return;

    const oldConfig = newConfig[itemIndex];
    const oldSection = oldConfig.section;
    const newSection =
      updates.section !== undefined ? updates.section : oldSection;
    const sectionChanged = oldSection !== newSection;

    // Update the item with new values
    newConfig[itemIndex] = { ...oldConfig, ...updates };

    // If section changed or order changed, we need to reorder
    if (sectionChanged || updates.order !== undefined) {
      // Remove the item from the array temporarily
      const [movedItem] = newConfig.splice(itemIndex, 1);

      // Get all items in the target section (excluding the moved item)
      const targetSectionItems = newConfig.filter(
        (c) => c.section === newSection,
      );

      // Determine the insert position
      const targetOrder =
        updates.order !== undefined ? updates.order : targetSectionItems.length;
      const insertIndex = Math.min(targetOrder, targetSectionItems.length);

      // Find the actual index in newConfig where we should insert
      let actualInsertIndex = 0;
      let sectionItemCount = 0;
      for (let i = 0; i < newConfig.length; i++) {
        if (newConfig[i].section === newSection) {
          if (sectionItemCount === insertIndex) {
            actualInsertIndex = i;
            break;
          }
          sectionItemCount++;
        }
      }

      // If we didn't find the position (inserting at end), find the last item of the section
      if (sectionItemCount < insertIndex || targetSectionItems.length === 0) {
        actualInsertIndex = newConfig.length;
        for (let i = newConfig.length - 1; i >= 0; i--) {
          if (newConfig[i].section === newSection) {
            actualInsertIndex = i + 1;
            break;
          }
        }
      }

      // Insert the item at the correct position
      newConfig.splice(actualInsertIndex, 0, movedItem);

      // Reorder all items in all affected sections
      const sectionsToReorder = sectionChanged
        ? [oldSection, newSection]
        : [newSection];
      sectionsToReorder.forEach((section) => {
        const sectionItems = newConfig.filter((c) => c.section === section);
        sectionItems.forEach((item, idx) => {
          const configIndex = newConfig.findIndex(
            (c) => c.nodeId === item.nodeId,
          );
          newConfig[configIndex].order = idx;
        });
      });
    }

    setCompileConfig(newConfig);
    if (store) {
      store.set("compileConfig", newConfig);
      store.save();
    }
  };

  // Remove item from manuscript and config
  const handleRemoveFromManuscript = (nodeId) => {
    const newData = manuscriptData.filter((item) => item.id !== nodeId);
    const newConfig = compileConfig.filter(
      (config) => config.nodeId !== nodeId,
    );

    setManuscriptData(newData);
    setCompileConfig(newConfig);

    if (store) {
      store.set("manuscript", newData);
      store.set("compileConfig", newConfig);
      store.save();
    }
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

            <div className="w-full flex flex-col lg:flex-row gap-4">
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
                      <h3 className="w-fit  min-h-fit px-2 flex justify-start items-center   text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
                        Manuscript Content
                      </h3>
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
                  data={manuscriptData}
                  compileConfig={compileConfig}
                  onUpdateConfig={handleUpdateConfig}
                  onRemove={handleRemoveFromManuscript}
                  onAddVirtual={handleAddVirtualItem}
                />
              )}
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
