import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import { motion, AnimatePresence } from "motion/react";
import { queryData } from "../../lib/search";
import { useEffect, useState } from "react";
import itemLocalStateManager from "../../lib/itemLocalState";
import { max } from "lib0/math";
import useStoreHistory from "../../hooks/useStoreHistory";

const ActionBar = () => {
  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const sideBarOpened = appStore((state) => state.sideBarOpened);
  const setSideBarOpened = appStore((state) => state.setSideBarOpened);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      className="border-b z-[1000] border-appLayoutBorder w-full h-actionBarHeight min-h-actionBarHeight text-appLayoutText font-sans"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-start items-center relative"
      >
        <ActionButton
          onClick={() => {
            if (canGoBack) {
              goBack();
            }
          }}
          disabled={!canGoBack}
        >
          <div className="h-full w-actionBarButtonIconSize relative">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: canGoBack ? 1 : 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              key="sideBarOpened"
              className="icon-[material-symbols-light--arrow-back-rounded] w-full h-full top-0 left-0 absolute"
            ></motion.span>
          </div>
        </ActionButton>
        
        <ActionButton onClick={() => setSideBarOpened(!sideBarOpened)}>
          <div className="h-full w-actionBarButtonIconSize relative">
            <AnimatePresence mode="sync">
              {sideBarOpened && (
                <motion.span
                  initial={{ opacity: 0.6, rotate: 180 }}
                  animate={{ opacity: 1, rotate: 180 }}
                  exit={{ opacity: 0.6, rotate: 180 }}
                  transition={{ duration: 0.05 }}
                  key="sideBarOpened"
                  className="icon-[octicon--sidebar-collapse-24] w-full h-full top-0 left-0 absolute"
                ></motion.span>
              )}
              {!sideBarOpened && (
                <motion.span
                  initial={{ opacity: 0.6, rotate: 180 }}
                  animate={{ opacity: 1, rotate: 180 }}
                  exit={{ opacity: 0.6, rotate: 180 }}
                  transition={{ duration: 0.05 }}
                  key="sideBarClosed"
                  className="icon-[octicon--sidebar-expand-24] w-full h-full top-0 left-0 absolute"
                ></motion.span>
              )}
            </AnimatePresence>
          </div>
        </ActionButton>

        {/* 
        <div
          className={`logo h-full w-actionBarLogoSize flex items-center justify-center font-serif pointer-events-none select-none`}
        >
          <span className="icon-[ph--flower-tulip-thin] h-actionBarLogoSize w-actionBarLogoSize"></span>
        </div> */}

        {/* <ActionButton
          onClick={async () => {
            console.log(await queryData("Untitled"));
          }}
        >
          <span className="icon-[material-symbols-light--search] h-actionBarButtonIconSize w-actionBarButtonIconSize"></span>
        </ActionButton> */}

        <div className="absolute h-full w-fit top-0 left-1/2 -translate-x-1/2">
          <SearchBar />
        </div>

        <div className="flex-grow"></div>

        {/* <ActionButton>
          <span className="icon-[line-md--question] h-actionBarButtonIconSize w-actionBarButtonIconSize"></span>
        </ActionButton> */}

        {deviceType !== "mobile" && (
          <>
            <WindowButton
              className={`ml-1`}
              buttonContent={
                <span className="icon-[mdi--window-minimize] w-actionBarButtonIconSize h-actionBarButtonIconSize"></span>
              }
              onClick={() => {
                appWindow.minimize();
              }}
            />
            <WindowButton
              className={``}
              buttonContent={
                <span className="icon-[mdi--window-maximize] w-actionBarButtonIconSize h-actionBarButtonIconSize"></span>
              }
              onClick={() => {
                appWindow.toggleMaximize();
              }}
            />
            <WindowButton
              destructive={true}
              className={``}
              buttonContent={
                <span className="icon-[mdi--window-close] w-actionBarButtonIconSize h-actionBarButtonIconSize"></span>
              }
              onClick={() => {
                appWindow.close();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ActionBar;

const ActionButton = ({ onClick, className, children, disabled = false }) => {
  return (
    <div className="h-full py-1 w-fit ml-1">
      <button
        className={`h-full px-1 w-fit ${
          !disabled && "hover:bg-appLayoutInverseHover"
        } rounded-md flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

const WindowButton = ({
  onClick,
  className,
  buttonContent,
  destructive = false,
}) => {
  return (
    <button
      className={`h-full flex items-center px-4 w-fit ${
        destructive
          ? "hover:bg-appLayoutDestruct hover:bg-opacity-70"
          : "hover:bg-appLayoutInverseHover"
      } ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};

const SearchBar = () => {
  const { deviceType } = useDeviceType();

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setActivity = appStore((state) => state.setActivity);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      setSearchResults(queryData(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  console.log(
    "Sroted results: ",
    searchResults.toSorted((a, b) => {
      if (!itemLocalStateManager.getLastOpened(a.id)) {
        return false;
      } else if (!itemLocalStateManager.getLastOpened(b.id)) {
        return true;
      } else {
        return (
          itemLocalStateManager.getLastOpened(b.id) -
          itemLocalStateManager.getLastOpened(a.id)
        );
      }
    })
  );

  return (
    <div className="relative h-full py-1 w-actionBarSearchWidth ml-1 text-actionBarSearchTextSize">
      <input
        name="searchQuery"
        placeholder=""
        value={searchQuery}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          paddingLeft: "calc(0.5rem + var(--actionBarButtonIconSize))",
        }}
        className={`h-full px-2 w-full focus:outline-none bg-appBackground hover:bg-appLayoutInputBackground focus:bg-appLayoutInputBackground transition-colors duration-100 rounded-md border border-appLayoutInverseHover`}
      ></input>
      <span className="icon-[material-symbols-light--search] h-actionBarButtonIconSize w-actionBarButtonIconSize absolute top-1/2 -translate-y-1/2 left-1"></span>
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute top-[100%] pt-1 px-1 h-fit w-full bg-appBackground rounded-md z-[1000] border border-appLayoutInverseHover overflow-hidden shadow-2xl shadow-appLayoutGentleShadow flex items-center flex-col"
          >
            <div
              style={{
                paddingLeft: `calc(1rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                paddingRight: `calc(1rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
              }}
              className="w-full h-actionBarSearchHeaderHeight text-actionBarResultHeaderTextSize text-appLayoutTextMuted flex items-center"
            >
              <span>
                {" "}
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "result" : "results"} in your
                libraries
              </span>
              <span className="ml-auto text-appLayoutTextMuted text-actionBarResultDateFontSize">
                Last opened at
              </span>
            </div>
            <div className="w-[98.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>
            <div
              style={{
                paddingLeft: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
              }}
              className="w-full max-h-actionBarSearchMaxHeight overflow-y-scroll text-actionBarResultTextSize flex flex-col py-1"
            >
              {searchResults.length > 0 &&
                searchResults
                  .toSorted((a, b) => {
                    if (!itemLocalStateManager.getLastOpened(a.id)) {
                      return false;
                    } else if (!itemLocalStateManager.getLastOpened(b.id)) {
                      return true;
                    } else {
                      return (
                        itemLocalStateManager.getLastOpened(b.id) -
                        itemLocalStateManager.getLastOpened(a.id)
                      );
                    }
                  })
                  .map((result) => {
                    return (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={result.id}
                        onClick={() => {
                          if (result.library_name) {
                            setLibraryId(result.libraryId);
                            setItemId("unselected");
                            if (deviceType === "mobile") {
                              setPanelOpened(false);
                            }
                            setPanelOpened(true);
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
                            console.log(
                              "Opening from search: ",
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
                        }}
                        style={{
                          paddingTop: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                          paddingBottom: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                        }}
                        className="px-3 h-actionBarResultNodeHeight w-full flex items-center hover:bg-appLayoutInverseHover rounded-md "
                      >
                        <span> {result.library_name || result.item_title}</span>
                        <span className="ml-auto text-appLayoutTextMuted text-actionBarResultDateFontSize">
                          {new Date(
                            itemLocalStateManager.getLastOpened(result.id)
                          ).toLocaleString()}
                        </span>
                      </motion.button>
                    );
                  })}

              {searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="noResults"
                  style={{
                    paddingTop: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                    paddingBottom: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                  }}
                  className="px-1 h-actionBarResultNodeHeight flex items-center justify-center text-appLayoutTextMuted"
                >
                  No results found
                </motion.div>
              )}
            </div>
            <div className="w-[98.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>

            <div className="w-full px-2 h-actionBarSearchFooterHeight text-actionBarResultHeaderTextSize flex items-center"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
