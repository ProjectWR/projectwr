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

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const dictionaryMode = appStore((state) => state.dictionaryMode);
  const setDictionaryMode = appStore((state) => state.setDictionaryMode);

  const prevWordArrayRef = useRef(null);

  /** @type {[]} */
  const wordArray = useSyncExternalStore(
    (callback) => {
      dictionaryManager.dictionaryYDoc.getMap("wordMap").observeDeep(callback);

      return () => {
        dictionaryManager.dictionaryYDoc
          .getMap("wordMap")
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
    return wordArray.sort((a, b) => {
      return a < b;
    });
  }, [wordArray]);

  console.log("Checking word array on rerender: ", sortedWordArray);

  const handleCreateWord = () => {
    if (dictionaryMode !== "create") {
      setDictionaryMode("create");
      saveStateInHistory();
      clearFuture();
    }
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
          className={`h-fit grow pt-1 text-libraryManagerHeaderText text-appLayoutText order-2 ${
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
        className={`grow flex flex-col w-full justify-start items-center overflow-y-scroll pt-1 ${
          deviceType === "mobile" ? "no-scrollbar" : ""
        }`}
        style={{
          paddingLeft: `var(--scrollbarWidth)`,
        }}
      >
        <div
          id="WordListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        >
          {sortedWordArray?.map((word) => (
            <div
              key={word}
              id={`WordListNode-${word}`}
              className="w-full h-libraryManagerNodeHeight min-h-libraryManagerNodeHeight"
            >
              <DictionaryManagerNode word={word} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DictionaryManager;

const DictionaryManagerNode = ({ word }) => {
  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const setDictionaryWord = appStore((state) => state.setDictionaryWord);
  const dictionaryWord = appStore((state) => state.dictionaryWord);

  const setDictionaryMode = appStore((state) => state.setDictionaryMode);
  const dictionaryMode = appStore((state) => state.dictionaryMode);

  const setPanelOpened = appStore((state) => state.setPanelOpened);


  return (
    <div className="w-full h-full flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-0 rounded-lg">
      <button
        className={`grow h-full flex justify-start items-center pl-4 text-libraryManagerNodeText hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-0 rounded-l-lg`}
        onClick={() => {
          if (dictionaryWord !== word || dictionaryMode !== "details") {
            setDictionaryMode("details");
            setDictionaryWord(word);
            if (deviceType === "mobile") {
              setPanelOpened(false);
            }

            setPanelOpened(true);
            saveStateInHistory();
            clearFuture();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <p className="transition-colors duration-100">{word}</p>
        </div>
      </button>
    </div>
  );
};
