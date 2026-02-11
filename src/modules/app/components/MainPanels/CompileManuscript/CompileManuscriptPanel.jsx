import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import BinderView from "./BinderView";
import ManuscriptView from "./ManuscriptView";
import { Store } from "@tauri-apps/plugin-store";

const CompileManuscriptPanel = ({ libraryId }) => {
  const [store, setStore] = useState(null);
  const [manuscriptData, setManuscriptData] = useState([]);

  useEffect(() => {
    const initStore = async () => {
      const newStore = new Store(`compile_manuscript_${libraryId}.json`);
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

  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-appBackground">
      {/* Binder View (Source) */}
      <div className="w-1/3 h-full border-r border-appLayoutBorder flex flex-col">
        <div className="p-2 border-b border-appLayoutBorder bg-appLayoutBackground">
          <h3 className="font-semibold text-appLayoutText">Binder</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <BinderView libraryId={libraryId} />
        </div>
      </div>

      {/* Manuscript View (Destination) */}
      <div className="w-2/3 h-full flex flex-col bg-appLayoutBackgroundSecondary">
        <div className="p-2 border-b border-appLayoutBorder bg-appLayoutBackground">
          <h3 className="font-semibold text-appLayoutText">
            Manuscript Outline
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <ManuscriptView data={manuscriptData} onUpdate={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default CompileManuscriptPanel;

CompileManuscriptPanel.propTypes = {
  libraryId: PropTypes.string.isRequired,
};
