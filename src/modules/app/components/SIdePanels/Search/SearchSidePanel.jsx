import { useCallback, useEffect, useRef, useState } from "react";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import useStoreHistory from "../../../hooks/useStoreHistory";
import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import useYMap from "../../../hooks/useYMap";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import useMainPanel from "../../../hooks/useMainPanel";
import { ScrollArea } from "@mantine/core";
import itemLocalStateManager from "../../../lib/itemLocalState";
import { queryData } from "../../../lib/search";

const SearchSidePanel = ({ libraryId }) => {
  console.log("Search Panel was rendered: ", libraryId);
  const { deviceType } = useDeviceType();

  const searchInputRef = useRef(null);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setActivity = appStore((state) => state.setActivity);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const searchQuery = appStore((state) => state.searchQuery);
  const setSearchQuery = appStore((state) => state.setSearchQuery);

  const { activatePanel } = useMainPanel();

  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
  };

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const libraryPropsMapRef = useRef(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );
  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setSearchResults(queryData(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div
      id="SearchContainer"
      className={`h-full w-full flex flex-col items-center`}
    >
      <div
        id="SearchHeader"
        className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-appLayoutBorder  z-1`}
      >
        <div className="h-fit min-h-fit max-h-full py-3 w-full flex items-center justify-start order-2">
          <h1
            className={`h-fit w-full grow pt-1 px-3 text-libraryManagerHeaderText text-appLayoutText order-2 ${
              deviceType === "mobile" ? "ml-3" : ""
            }
                ${"text-shadow-md text-shadow-appLayoutHighlight"}
              `}
          >
            <motion.p
              animate={{
                textShadow: "none",
              }}
              className="max-w-full w-full h-fit text-nowrap overflow-hidden text-ellipsis"
            >
              {libraryPropsMapState.item_properties.item_title}
            </motion.p>
          </h1>
        </div>
      </div>

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>

      <div
        id="SearchInputContainer"
        className={`flex flex-col items-center justify-between h-fit w-full px-2 min-h-fit mt-0 border-appLayoutBorder   z-1`}
      >
        <div className="h-fit min-h-fit py-1 w-full flex flex-row gap-1 items-center">
          <input
            value={searchQuery}
            ref={searchInputRef}
            onChange={handleChange}
            type="text"
            placeholder="Search"
            className="h-fit min-h-fit text-libraryDirectoryPaperNodeFontSize w-full px-2 py-px bg-appBackground focus:outline-none focus:border-appLayoutGradientHover border-appLayoutBorder border rounded-sm"
          />
        </div>

        {searchResults.length > 0 && (
          <>
            <div className="divider w-full px-1">
              <div className="w-full h-px bg-appLayoutBorder"></div>
            </div>
            <div className="h-fit min-h-fit w-fit flex flex-row gap-1 items-center">
              <span className="h-fit min-h-fit text-libraryDirectoryPaperNodeFontSize w-full  text-appLayoutTextMuted">
                {searchResults.length} results
              </span>
            </div>
          </>
        )}
      </div>

      <div id="SearchBodyContainer" className={`grow min-h-0 w-full mt-0`}>
        <ScrollArea
          overscrollBehavior="none"
          scrollbars="y"
          type="hover"
          classNames={{
            root: "w-full h-full",
            scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidthThin z-[5]`,
            thumb: `bg-appLayoutBorder rounded-t-full hover:!bg-appLayoutInverseHover opacity-70`,
            content: `h-fit w-full px-1`,
          }}
        >
          <div
            id="SearchListContainer"
            className="h-fit w-full px-2 flex flex-col gap-0 justify-start items-center"
          >
            {searchResults.length > 0 &&
              searchResults
                .toSorted((a, b) => {
                  if (!itemLocalStateManager.getLastOpened(a.libraryId, a.id)) {
                    return false;
                  } else if (
                    !itemLocalStateManager.getLastOpened(b.libraryId, b.id)
                  ) {
                    return true;
                  } else {
                    return (
                      itemLocalStateManager.getLastOpened(b.libraryId, b.id) -
                      itemLocalStateManager.getLastOpened(a.libraryId, a.id)
                    );
                  }
                })
                .map((result, index) => {
                  const item_properties =
                    result.id === result.libraryId
                      ? dataManagerSubdocs
                          .getLibrary(result.libraryId)
                          .getMap("library_props")
                          .get("item_properties")
                      : dataManagerSubdocs
                          .getLibrary(result.libraryId)
                          .getMap("library_directory")
                          .get(result.id)
                          .get("value")
                          .get("item_properties");

                  return (
                    <div
                      key={result.id}
                      className="h-fit w-full flex gap-1 items-center"
                    >
                      <span className="text-libraryDirectoryBookNodeFontSize pb-px text-appLayoutTextMuted w-fit h-fit">
                        -
                      </span>
                      <SearchNode
                        label={item_properties.item_title}
                        onClick={() => {
                          if (item_properties.item_title) {
                            setLibraryId(result.libraryId);
                            setItemId("unselected");
                            if (deviceType === "mobile") {
                              setPanelOpened(false);
                            }
                            setPanelOpened(true);

                            activatePanel("libraries", "details", [
                              result.libraryId,
                            ]);
                          }

                          if (
                            result.type === "book" ||
                            result.type === "paper" ||
                            result.type === "section"
                          ) {
                            itemLocalStateManager.setItemAndParentsOpened(
                              result.libraryId,
                              result.id
                            );

                            setLibraryId(result.libraryId);
                            setItemId(result.id);
                            setItemMode("details");
                            if (deviceType === "mobile") {
                              setPanelOpened(false);
                            }
                            setPanelOpened(true);
                          }
                          setActivity("libraries");

                          activatePanel("libraries", "details", [
                            result.libraryId,
                            result.id,
                          ]);
                        }}
                      />
                    </div>
                  );
                })}

            {searchResults.length === 0 && (
              <SearchNode disabled={true} label={"No Results Found"} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SearchSidePanel;

const SearchNode = ({ itemId, label, onClick, disabled }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        id="DirectoryItemNodeHeader"
        key={`searchNode-${itemId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.05 }}
        className={`flex justify-between items-center ${
          disabled ? "" : "hover:bg-appLayoutHover"
        }
                    px-1 
                    rounded-sm
        
                    h-libraryDirectoryPaperNodeHeight

                    w-full
            
                    transition-colors
                    duration-0
        
                `}
      >
        <button
          className="grow min-w-0 flex items-center justify-start h-full"
          onClick={onClick}
          disabled={disabled}
        >
          <div className="grow ml-1 text-libraryDirectoryBookNodeFontSize min-w-0 h-full flex items-center justify-start">
            <span className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis">
              {label}
            </span>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
