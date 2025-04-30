import { useEffect, useMemo, useRef, useState } from "react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import dictionaryManager from "../../lib/dictionary";
import { appStore } from "../../stores/appStore";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";
import useYMap from "../../hooks/useYMap";

const DictionaryDetailsPanel = ({ word }) => {
  console.log("dicitonary create panel rendering: ");
  const { deviceType } = useDeviceType();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const initialWordProperties = useRef(dictionaryManager.getWord(word));

  const [wordProperties, setWordProperties] = useState(
    dictionaryManager.getWord(word)
  );

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(wordProperties, initialWordProperties.current);
  }, [wordProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setWordProperties({
      ...wordProperties,
      [name]: value,
    });
  };

  const createWord = () => {
    dictionaryManager.addOrUpdateWord(
      wordProperties.word,
      wordProperties.definition,
      wordProperties.synonyms
    );

    setWordProperties(initialWordProperties.current);
  };

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        createWord();
      }}
      id="DictionaryCreateContainer"
      className={`h-full flex flex-col items-center justify-start 
      ${deviceType === "mobile" && "w-full"}   
      ${deviceType === "desktop" && "mt-10"}       
    `}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      <div
        id="CreateWordHeader"
        className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 
          ${deviceType === "desktop" && "px-6"}
        `}
      >
        {deviceType === "mobile" && (
          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 ml-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center
             order-first
          `}
            onClick={() => {
              setPanelOpened(true);
              setItemId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        )}

        <p className="bg-appBackground grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 px-2 pr-1 transition-colors duration-200 order-2">
          {wordProperties.word}
        </p>
      </div>

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>
      <div
        id="CreateWordBody"
        className="grow w-full flex flex-col items-center justify-start border-b border-appLayoutBorder py-4 gap-3 px-6"
      >
        <AnimatePresence>
          {unsavedChangesExist && (
            <motion.button
              type="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center
                order-last
            `}
            >
              <motion.span
                animate={{
                  opacity: 1,
                }}
                className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
              ></motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

export default DictionaryDetailsPanel;
