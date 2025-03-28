import { useEffect, useMemo, useState } from "react";
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
  const panelOpened = appStore((state) => state.panelOpened);
  const dictionaryMode = appStore((state) => state.dictionaryMode);
  const dictionaryWord = appStore((state) => state.dictionaryWord);

  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setTemplateId = appStore((state) => state.setTemplateId);
  const setTemplateMode = appStore((state) => state.setTemplateMode);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setDictionaryMode = appStore((state) => state.setDictionaryMode);
  const setDictionaryWord = appStore((state) => state.setDictionaryWord);

  const saveStateInHistory = () => {
    past.push({
      activity,
      libraryId,
      itemId,
      itemMode,
      templateId,
      templateMode,
      panelOpened,
      dictionaryMode,
      dictionaryWord,
    });
  };

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    console.log(
      "State History past and future length check: ",
      past.length,
      future.length
    );
    if (past.length > 0) setCanGoBack(true);
    else setCanGoBack(false);
    if (future.length > 0) setCanGoForward(true);
    else setCanGoForward(false);
  }, [
    activity,
    libraryId,
    itemId,
    itemMode,
    templateId,
    templateMode,
    dictionaryMode,
    dictionaryWord,
  ]);

  const goBack = () => {
    if (!canGoBack) return;

    saveStateInHistory();
    future.push(past.pop());

    const state = past.pop();

    setActivity(state.activity);
    setLibraryId(state.libraryId);
    setItemId(state.itemId);
    setItemMode(state.itemMode);
    setTemplateId(state.templateId);
    setTemplateMode(state.templateMode);
    setPanelOpened(state.panelOpened);
    setDictionaryMode(state.dictionaryMode);
    setDictionaryWord(state.dictionaryWord);
  };

  const goForward = () => {
    if (!canGoForward) return;

    future.push({
      activity,
      libraryId,
      itemId,
      itemMode,
      templateId,
      templateMode,
      panelOpened,
      dictionaryMode,
      dictionaryWord,
    });

    past.push(future.pop());

    const state = future.pop();
    setActivity(state.activity);
    setLibraryId(state.libraryId);
    setItemId(state.itemId);
    setItemMode(state.itemMode);
    setTemplateId(state.templateId);
    setTemplateMode(state.templateMode);
    setPanelOpened(state.panelOpened);
    setDictionaryMode(state.dictionaryMode);
    setDictionaryWord(state.dictionaryWord);
  };

  const clearFuture = () => {
    future.length = 0;
    setCanGoForward(false);
  };

  return {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  };
};

export default useStoreHistory;
