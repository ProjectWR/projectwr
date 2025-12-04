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

  // Get sorted word array
  const sortedWords = useMemo(() => {
    return Object.keys(wordMap || {}).sort((a, b) => a.localeCompare(b));
  }, [wordMap]);

  // Get selected word data
  const selectedWordData = useMemo(() => {
    if (!selectedWord || !wordMap) return null;
    return wordMap[selectedWord];
  }, [selectedWord, wordMap]);

  // Word properties state for editing
  const [wordProperties, setWordProperties] = useState({
    item_description: { type: "doc", content: [] },
  });

  // Update word properties when selection changes
  useEffect(() => {
    if (selectedWordData) {
      setWordProperties({
        item_description: selectedWordData.definition || {
          type: "doc",
          content: [],
        },
      });
    }
  }, [selectedWordData]);

  // Auto-save definition changes
  const prevWordPropertiesRef = useRef(wordProperties);
  useEffect(() => {
    if (
      selectedWord &&
      selectedWordData &&
      !equalityDeep(prevWordPropertiesRef.current, wordProperties)
    ) {
      // Save after a short delay to avoid saving on every keystroke
      const timeoutId = setTimeout(() => {
        dictionaryManager.addOrUpdateWord(
          selectedWord,
          wordProperties.item_description,
          selectedWordData.synonyms || ""
        );
      }, 500);

      prevWordPropertiesRef.current = wordProperties;

      return () => clearTimeout(timeoutId);
    }
  }, [wordProperties, selectedWord, selectedWordData]);

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
                <div className="w-full h-fit px-3 py-3 border-b border-appLayoutBorder">
                  <div className="w-full flex gap-2">
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
                      placeholder="Add new word..."
                      className="grow px-3 py-2 text-detailsPanelPropFontSize text-appLayoutText bg-appLayoutInputBackground border border-appLayoutBorder rounded-md focus:outline-none focus:border-appLayoutHighlight transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={handleCreateWord}
                      disabled={!newWordInput.trim()}
                      className="w-10 h-10 flex items-center justify-center rounded-md bg-appLayoutPressed hover:bg-appLayoutHighlight text-appBackground disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <span className="icon-[material-symbols-light--add-2-rounded] w-6 h-6"></span>
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
                    <div className="w-full h-fit flex flex-col">
                      {sortedWords.map((word) => (
                        <div
                          key={word}
                          className="relative group"
                          onMouseEnter={() => setHoveredWord(word)}
                          onMouseLeave={() => setHoveredWord(null)}
                        >
                          <button
                            type="button"
                            onClick={() => handleWordSelect(word)}
                            className={`w-full px-4 py-3 text-left text-detailsPanelPropFontSize transition-colors duration-100 flex items-center justify-between ${
                              selectedWord === word
                                ? "bg-appLayoutPressed text-appLayoutHighlight"
                                : "hover:bg-appLayoutHover text-appLayoutText"
                            }`}
                          >
                            <span className="truncate">{word}</span>
                            {hoveredWord === word && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWord(word);
                                }}
                                className="ml-2 w-6 h-6 flex items-center justify-center rounded hover:bg-appLayoutInverseHover text-appLayoutTextMuted hover:text-red-500 transition-colors duration-100"
                              >
                                <span className="icon-[ph--trash-thin] w-5 h-5"></span>
                              </button>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Display Panel - Word Details (2/3) */}
              <div className="col-span-2 h-full flex flex-col overflow-hidden">
                {selectedWord && selectedWordData ? (
                  <div className="w-full h-full flex flex-col">
                    {/* Word Header */}
                    <div className="w-full h-fit px-6 py-4 border-b border-appLayoutBorder flex items-center justify-between">
                      <h3 className="text-detailsPanelTitleFontSize font-semibold text-appLayoutText">
                        {selectedWord}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteWord(selectedWord)}
                        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-appLayoutInverseHover text-appLayoutTextMuted hover:text-red-500 transition-colors duration-200"
                      >
                        <span className="icon-[ph--trash-thin] w-6 h-6"></span>
                      </button>
                    </div>

                    {/* Word Definition */}
                    <div className="grow overflow-y-auto px-3">
                      <DetailsPanelProperties>
                        <DetailsPanelDescriptionProp
                          itemProperties={wordProperties}
                          setItemProperties={setWordProperties}
                          label="Definition"
                        />
                      </DetailsPanelProperties>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center px-8 py-12">
                    <p className="text-appLayoutTextMuted text-center text-detailsPanelPropFontSize">
                      {sortedWords.length === 0
                        ? "Add a word to get started"
                        : "Select a word from the list to view and edit its definition"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DetailsPanelProperties>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default DictionaryPanel;
