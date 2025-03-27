import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { appStore } from "../../../stores/appStore";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { equalityDeep } from "lib0/function";
import useStoreHistory from "../../../hooks/useStoreHistory";
import dictionaryManager from "../../../lib/dictionary";

const DictionaryManager = () => {
  console.log("Template Manager was rendered");
  const { deviceType } = useDeviceType();

  const prevWordArrayRef = useRef(null);

  /** @type {[]} */
  const wordArray = useSyncExternalStore(
    (callback) => {
      dictionaryManager.dictionaryYDoc
        .getArray("wordArray")
        .observeDeep(callback);

      return () => {
        dictionaryManager.dictionaryYDoc
          .getArray("wordArray")
          .unobserveDeep(callback);
      };
    },
    () => {
      const wordArray = dictionaryManager.getWordArray();
      if (
        prevWordArrayRef.current !== null &&
        prevWordArrayRef.current !== undefined &&
        equalityDeep(prevWordArrayRef.current, wordArray)
      ) {
        return prevWordArrayRef.current;
      } else {
        prevWordArrayRef.current = wordArray;
        return prevWordArrayRef.current;
      }
    }
  );

  const sortedWordArray = useMemo(() => {
    wordArray.sort((a, b) => {
      a.word < b.word;
    });
  }, [wordArray]);

  const handleCreateWord = () => {
    //
  };

  return (
    <div
      id="DictionaryManagerContainer"
      className="h-full max-h-full w-full flex flex-col items-center"
    >
      <div
        id="DictionaryManagerHeader"
        className={`flex items-center justify-start w-full gap-2 px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-appLayoutBorder`}
      >
        <h1
          className={`h-fit flex-grow pt-1 text-libraryManagerHeaderText text-appLayoutText order-2 ${
            deviceType === "mobile" ? "ml-3" : "ml-6"
          }`}
        >
          Your Glossary
        </h1>

        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize text-appLayoutTextMuted transition-colors duration-0 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4`}
          onClick={handleCreateWord}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>
      <div
        id="DictionaryManagerBody"
        className={`flex-grow flex flex-col w-full justify-start items-center overflow-y-scroll pt-1 ${
          deviceType === "mobile" ? "no-scrollbar" : ""
        }`}
        style={{
          paddingLeft: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
        }}
      >
        <div
          id="TemplateListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        ></div>
      </div>
    </div>
  );
};

export default DictionaryManager;

const DictionaryManagerNode = ({ word, index }) => {
  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const panelOpened = appStore((state) => state.panelOpened);

  return (
    <div className="w-full h-full flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-0 rounded-lg">
      <button
        className={`flex-grow h-full flex justify-start items-center pl-4 text-libraryManagerNodeText hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-0 rounded-l-lg`}
        onClick={() => {}}
      >
        <div className="flex items-center gap-2">
          <span className="icon-[carbon--template] h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize transition-colors duration-100"></span>
          <p className="transition-colors duration-100">{word}</p>
        </div>
      </button>
      <button
        className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth transition-colors duration-0 px-2 m-2 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight"
        onClick={() => {}}
      >
        <span className="icon-[mdi--edit-outline] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
      </button>
    </div>
  );
};
