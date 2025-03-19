import { useEffect } from "react";
import { appStore } from "../stores/appStore";

const past = [];
const future = [];

/**
 * @typedef {Object} TimeSlice
 * @property {string} activity
 * @property {string} libraryId
 * @property {string} itemId
 * @property {string} itemMode
 * @property {string} templateId
 * @property {string} templateMode
 * @property {boolean} [past]
 */

const useStoreHistory = () => {
  const activity = appStore((state) => state.activity);
  const libraryId = appStore((state) => state.libraryId);
  const itemId = appStore((state) => state.itemId);
  const itemMode = appStore((state) => state.itemMode);
  const templateId = appStore((state) => state.templateId);
  const templateMode = appStore((state) => state.templateMode);

  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setTemplateId = appStore((state) => state.setTemplateId);
  const setTemplateMode = appStore((state) => state.setTemplateMode);

  useEffect(() => {
    past.push({
      activity,
      libraryId,
      itemId,
      itemMode,
      templateId,
      templateMode,
      past: true,
    });
  }, [activity, libraryId, itemId, itemMode, templateId, templateMode]);

  const goBack = () => {
    
  }

  const goForward = () => {

  }

};

export default useStoreHistory;
