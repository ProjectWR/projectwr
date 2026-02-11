import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import BinderView from "./BinderView";
import ManuscriptView from "./ManuscriptView";
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
    store.set("manuscript", newData);
    store.save();
  };

  return (
    <DetailsPanel>
      <div id="CompileManuscriptContent" className={formClassName}>
        <DetailsPanelHeader>
          <DetailsPanelNameLabel>Compile Manuscript</DetailsPanelNameLabel>
        </DetailsPanelHeader>
        <DetailsPanelBody>
          <DetailsPanelProperties>
            <div className="w-full flex flex-col lg:flex-row gap-4">
              {/* Binder View (Source) */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="w-full px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
                  <h3 className="w-fit px-2 flex justify-start items-center   text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
                    Binder
                  </h3>
                  <div className="divider w-full px-1">
                    <div className="w-full h-px bg-appLayoutBorder"></div>
                  </div>
                  <div className="flex-1 w-full overflow-auto">
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
                    Manuscript Outline
                  </h3>
                  <div className="divider w-full px-1">
                    <div className="w-full h-px bg-appLayoutBorder"></div>
                  </div>
                  <div className="flex-1 basis-0 min-h-0 overflow-auto">
                    <ManuscriptView
                      data={manuscriptData}
                      onUpdate={handleSave}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DetailsPanelProperties>
        </DetailsPanelBody>
      </div>
    </DetailsPanel>
  );

  return (
    <div className="w-full h-full flex flex-row justify-center gap-2 overflow-hidden bg-appBackground">
      {/* Binder View (Source) */}
      <div className="w-sidePanelWidth h-full flex flex-col">
        <div className="w-full h-full px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
          <h3 className="w-fit h-fit px-2 flex justify-start items-center   text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
            Binder
          </h3>
          <div className="divider w-full px-1">
            <div className="w-full h-px bg-appLayoutBorder"></div>
          </div>
          <div className="flex-1 w-full overflow-auto">
            <BinderView libraryId={libraryId} onAdd={addItemsToManuscript} />
          </div>
        </div>
      </div>

      {/* Manuscript View (Destination) */}
      <div className="w-sidePanelWidth h-full flex flex-col">
        <div className="w-full h-full px-1 pt-1 flex flex-col items-start gap-1 border border-transparent rounded-md overflow-hidden">
          <h3 className="w-fit h-fit min-h-fit px-2 flex justify-start items-center   text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
            Manuscript Outline
          </h3>
          <div className="divider w-full px-1">
            <div className="w-full h-px bg-appLayoutBorder"></div>
          </div>
          <div className="flex-1 basis-0 min-h-0 overflow-auto">
            <ManuscriptView data={manuscriptData} onUpdate={handleSave} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompileManuscriptPanel;

CompileManuscriptPanel.propTypes = {
  libraryId: PropTypes.string.isRequired,
};
