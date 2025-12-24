import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { equalityDeep } from "lib0/function";
import dictionaryManager from "../../lib/dictionary";
import DetailsPanel, {
  formClassName,
} from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import {
  DetailsPanelBody,
  DetailsPanelProperties,
} from "../LayoutComponents/DetailsPanel/DetailsPanelBody";
import { DetailsPanelDescriptionProp } from "../LayoutComponents/DetailsPanel/DetailsPanelProps";
import { motion, AnimatePresence } from "motion/react";

const DictionaryPanel = () => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [newWordInput, setNewWordInput] = useState("");
  const [hoveredWord, setHoveredWord] = useState(null);

  const prevWordMapRef = useRef(null);

  // Subscribe to word map changes
  const wordMap = useSyncExternalStore(
    (callback) => {
      dictionaryManager.dictionaryYDoc.getMap("wordMap").observe(callback);

      return () => {
        dictionaryManager.dictionaryYDoc.getMap("wordMap").unobserve(callback);
      };
    },
    () => {
      const wordMap = dictionaryManager.dictionaryYDoc
        .getMap("wordMap")
        .toJSON();
      if (
        prevWordMapRef.current !== null &&
        prevWordMapRef.current !== undefined &&
        equalityDeep(prevWordMapRef.current, wordMap)
      ) {
        return prevWordMapRef.current;
      } else {
        prevWordMapRef.current = wordMap;
        return prevWordMapRef.current;
      }
    }
  );

  // Get sorted and filtered word array
  const sortedWords = useMemo(() => {
    const allWords = Object.keys(wordMap || {}).sort((a, b) =>
      a.localeCompare(b)
    );

    // Filter words based on search input
    if (!newWordInput.trim()) {
      return allWords;
    }

    const searchTerm = newWordInput.toLowerCase();
    return allWords.filter((word) => word.toLowerCase().includes(searchTerm));
  }, [wordMap, newWordInput]);



  const handleCreateWord = () => {
    const trimmedWord = newWordInput.trim();
    if (trimmedWord) {
      dictionaryManager.addOrUpdateWord(trimmedWord, "", "");
      setSelectedWord(trimmedWord);
      setNewWordInput("");
    }
  };

  const handleDeleteWord = (word) => {
    dictionaryManager.removeWord(word);
    if (selectedWord === word) {
      setSelectedWord(null);
    }
  };

  const handleWordSelect = (word) => {
    setSelectedWord(word);
  };

  return (
    <DetailsPanel>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className={formClassName}
      >
        <DetailsPanelBody>
          <DetailsPanelProperties>
            <div className="w-full h-full grid grid-cols-3 gap-0">
              {/* Sidebar - Word List (1/3) */}
              <div className="col-span-1 h-full flex flex-col border-r border-appLayoutBorder">
                {/* Create Word Input */}
                <div className="w-full h-fit px-3 pb-2 border-b border-appLayoutBorder">
                  <div className="w-full flex gap-2 items-center">
                    <input
                      type="text"
                      value={newWordInput}
                      onChange={(e) => setNewWordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateWord();
                        }
                      }}
                      placeholder="Search or add a word..."
                      className="h-fit min-h-fit text-libraryDirectoryPaperNodeFontSize w-full px-2 py-px bg-appBackground focus:outline-none focus:border-appLayoutGradientHover border-appLayoutBorder border rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={handleCreateWord}
                      disabled={!newWordInput.trim()}
                      className="w-libraryManagerHeaderButtonSize text-appLayoutHighlight  h-libraryManagerHeaderButtonSize  flex items-center justify-center rounded-md bg-transparent hover:bg-appLayoutInverseHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <span className="icon-[material-symbols-light--add-2-rounded] w-full h-full"></span>
                    </button>
                  </div>
                </div>

                {/* Word List */}
                <div className="grow overflow-y-auto">
                  {sortedWords.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center px-4 py-8">
                      <p className="text-appLayoutTextMuted text-center text-detailsPanelPropFontSize">
                        No words in dictionary.
                        <br />
                        Add your first word above.
                      </p>
                    </div>
                  ) : (
                    <div className={`w-full h-fit`}>
                      {sortedWords.map((word) => (
                        <div
                          key={word}
                          className={`relative group flex items-center w-full pr-3 gap-1 h-fit ${selectedWord === word
                            ? "bg-appLayoutPressed text-appLayoutHighlight"
                            : "hover:bg-appLayoutHover text-appLayoutText"
                            }`}
                          onMouseEnter={() => setHoveredWord(word)}
                          onMouseLeave={() => setHoveredWord(null)}
                        >
                          <button
                            type="button"
                            onClick={() => handleWordSelect(word)}
                            className={`w-full px-4 py-1 text-left text-libraryDirectoryPaperNodeFontSize transition-colors duration-100 flex items-center justify-between ${selectedWord === word
                              ? "bg-appLayoutPressed text-appLayoutHighlight"
                              : "hover:bg-appLayoutHover text-appLayoutText"
                              }`}
                          >
                            <span className="truncate h-fit min-h-fit text-libraryDirectoryPaperNodeFontSize w-full px-2 py-px  focus:outline-none focus:border-appLayoutGradientHover border-transparent border rounded-sm">
                              {word}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWord(word);
                            }}
                            className={`w-libraryManagerHeaderButtonSize text-appLayoutHighlight  h-libraryManagerHeaderButtonSize  flex items-center justify-center rounded-md hover:bg-appLayoutInverseHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${selectedWord === word
                              ? "bg-appLayoutPressed text-appLayoutHighlight"
                              : "hover:bg-appLayoutHover text-appLayoutText"
                              }`}
                          >
                            <span className="icon-[ph--trash-thin] w-[80%] h-[80%]"></span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedWord && <WordPropertiesPanel selectedWord={selectedWord} handleDeleteWord={handleDeleteWord} />}

            </div>
          </DetailsPanelProperties>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default DictionaryPanel;

const WordPropertiesPanel = ({ selectedWord, handleDeleteWord }) => {
  const [definition, setDefinition] = useState(dictionaryManager.getWord(selectedWord)?.definition || { type: "doc", content: [] });
  const [originalDefinition, setOriginalDefinition] = useState(definition);

  // Load definition when selectedWord changes
  useEffect(() => {
    if (selectedWord) {
      const wordData = dictionaryManager.getWord(selectedWord);
      console.log("Loading word:", selectedWord, "Data:", wordData);
      if (wordData && wordData.definition) {
        setDefinition(wordData.definition);
      } else {
        setDefinition({ type: "doc", content: [] });
      }
    }
  }, [selectedWord]);

  return (
    <div className="col-span-2 h-full flex flex-col overflow-hidden" >
      {
        selectedWord ? (
          <div className="w-full h-full flex flex-col" >
            {/* Word Header */}
            < div className="w-full h-fit px-3 pb-2 border-b border-appLayoutBorder flex items-center justify-between" >
              <h3 className="h-fit min-h-fit text-libraryDirectoryPaperNodeFontSize w-full px-2 py-px bg-appBackground focus:outline-none focus:border-appLayoutGradientHover border-transparent border rounded-sm">
                {selectedWord}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteWord(selectedWord)}
                  className="w-libraryManagerHeaderButtonSize text-appLayoutHighlight  h-libraryManagerHeaderButtonSize  flex items-center justify-center rounded-md bg-transparent hover:bg-appLayoutInverseHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span className="icon-[ph--trash-thin] w-full h-full"></span>
                </button>
                <AnimatePresence>
                  {definition !== originalDefinition && (
                    <motion.button
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "var(--spacing-libraryManagerHeaderButtonSize)" }}
                      exit={{ opacity: 0, width: 0 }}
                      type="button"
                      onClick={() => {
                        dictionaryManager.addOrUpdateWord(
                          selectedWord,
                          definition,
                          null
                        )
                        setOriginalDefinition(definition);
                      }

                      }
                      className="w-libraryManagerHeaderButtonSize text-appLayoutHighlight  h-libraryManagerHeaderButtonSize  flex items-center justify-center rounded-md bg-transparent hover:bg-appLayoutInverseHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <span className="icon-[material-symbols-light--check-rounded] w-full h-full"></span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div >

            {/* Word Definition */}
            <div className="grow overflow-y-auto px-3" >
              <WordProperties
                key={selectedWord}
                selectedWord={selectedWord}
                definition={definition}
                setDefinition={setDefinition}
              />
            </div >
          </div >
        ) : (
          <div className="w-full h-full flex items-center justify-center px-8 py-12">
            <p className="text-appLayoutTextMuted text-center text-detailsPanelPropFontSize">
              {sortedWords.length === 0
                ? "Add a word to get started"
                : "Select a word from the list to view and edit its definition"}
            </p>
          </div>
        )
      }
    </div >)
}

const WordProperties = ({ selectedWord, definition, setDefinition }) => {
  console.log("DEFINITION in WordProperties:", definition);

  return (
    <DetailsPanelProperties>
      <DetailsPanelDescriptionProp
        key={selectedWord}
        description={definition}
        updateProperties={(content) => {
          setDefinition(content);
          console.log("SET DEFINITION: ", content);
        }}
        label="Definition"
      />
    </DetailsPanelProperties>
  );
};
