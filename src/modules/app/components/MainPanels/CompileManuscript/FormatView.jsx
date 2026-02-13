import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useDebounce } from "use-debounce";
import { load } from "@tauri-apps/plugin-store";
import { appStore } from "../../../stores/appStore";
import { useFormatSettings } from "./hooks/useFormatSettings";
import FormatEditor from "./components/FormatEditor";
import FormatPreview from "./components/FormatPreview";

const FormatView = ({ manuscriptData, compileConfig }) => {
  const [store, setStore] = useState(null);
  const libraryId = appStore((state) => state.libraryId);

  // Initialize store
  useEffect(() => {
    const initStore = async () => {
      const newStore = await load(`compile_manuscript_${libraryId}.json`);
      setStore(newStore);
    };
    initStore();
  }, [libraryId]);

  // Use format settings hook
  const {
    globalSettings,
    pageTypeSettings,
    pageSettings,
    isLoading,
    updateGlobalSettings,
    updatePageTypeSettings,
    updatePageSettings,
    getEffectiveSettingsForPage,
    resetSetting,
  } = useFormatSettings(store, libraryId);

  // Selected page for preview
  const [selectedPageId] = useState(null);

  // Get effective settings for preview (debounced for performance)
  const effectiveSettings = useMemo(() => {
    if (compileConfig.length === 0) return globalSettings;

    const firstPage =
      compileConfig.find((c) => c.nodeId === selectedPageId) ||
      compileConfig[0];

    return getEffectiveSettingsForPage({
      id: firstPage.nodeId,
      type: firstPage.type,
    });
  }, [
    globalSettings,
    selectedPageId,
    compileConfig,
    getEffectiveSettingsForPage,
  ]);

  // Debounce effective settings for preview to avoid too many re-renders
  const [debouncedSettings] = useDebounce(effectiveSettings, 500);

  // Prepare pages for preview
  const pages = useMemo(() => {
    return compileConfig.map((config) => {
      const binderItem = manuscriptData.find((d) => d.id === config.nodeId);
      return {
        id: config.nodeId,
        type: config.type,
        title: binderItem?.title || config.type,
        content: binderItem?.content || "<p>No content available</p>",
      };
    });
  }, [manuscriptData, compileConfig]);

  if (isLoading) {
    return (
      <div className="flex w-full grow items-center justify-center border border-appLayoutBorder rounded overflow-hidden">
        <p className="text-appLayoutTextMuted">Loading format settings...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full grow border border-appLayoutBorder rounded overflow-hidden">
      <div
        id="FormatEditorPanel"
        className="w-sidePanelWidth h-full border-r border-appLayoutBorder overflow-auto"
      >
        <FormatEditor
          compileConfig={compileConfig}
          globalSettings={globalSettings}
          pageTypeSettings={pageTypeSettings}
          pageSettings={pageSettings}
          onUpdateGlobal={updateGlobalSettings}
          onUpdatePageType={updatePageTypeSettings}
          onUpdatePage={updatePageSettings}
          onReset={resetSetting}
        />
      </div>
      <div id="FormatPreview" className="grow h-full overflow-hidden">
        <FormatPreview
          pages={pages}
          effectiveSettings={debouncedSettings}
          selectedPageId={selectedPageId}
        />
      </div>
    </div>
  );
};

FormatView.propTypes = {
  manuscriptData: PropTypes.array.isRequired,
  compileConfig: PropTypes.array.isRequired,
};

export default FormatView;
