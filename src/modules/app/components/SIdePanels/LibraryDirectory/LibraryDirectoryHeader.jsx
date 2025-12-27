import PropTypes from "prop-types";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { DropdownMenu } from "radix-ui";
import { appStore } from "../../../stores/appStore";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { sortArrayWithPropsByOrder } from "../../../utils/orderUtil";
import { equalityDeep } from "lib0/function";
import { setupSearchForLibrary } from "../../../lib/search";
import useMainPanel from "../../../hooks/useMainPanel";
import { StyledTooltip } from "../../LayoutComponents/StyledTooltip";
import LibraryDirectoryHeaderButton from "./LibraryDirectoryHeaderButton";
import ContextMenuWrapper from "../../LayoutComponents/ContextMenuWrapper";
import persistenceManagerForSubdocs from "../../../lib/persistenceSubDocs";
import { wait } from "lib0/promise";

const LibraryDirectoryHeader = () => {
  const { deviceType } = useDeviceType();

  const appLibraryId = appStore((state) => state.libraryId);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const { activatePanel } = useMainPanel();

  const [libraryHovered, setLibraryHovered] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const libraryDropdownRef = useRef(null);
  const [libraryDropdownHeight, setLibraryDropdownHeight] = useState(0);

  const libraryManagerOpened = appStore((state) => state.libraryManagerOpened);
  const setLibraryManagerOpened = appStore(
    (state) => state.setLibraryManagerOpened
  );

  const prevLibraryIdsWithPropsRef = useRef(null);

  useLayoutEffect(() => {
    if (libraryDropdownRef.current) {
      setLibraryDropdownHeight(libraryDropdownRef.current.scrollHeight);
    }
  }, [libraryManagerOpened]);

  // Get all libraries with props
  const libraryIdsWithProps = useSyncExternalStore(
    (callback) => {
      dataManagerSubdocs.addLibraryYDocMapCallback(callback);
      const libraryIds = getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap);
      for (const [libraryId] of libraryIds.values()) {
        dataManagerSubdocs
          .getLibrary(libraryId)
          .getMap("library_props")
          .observe(callback);
      }

      return () => {
        const newLibraryIds = getArrayFromYDocMap(
          dataManagerSubdocs.libraryYDocMap
        );
        for (const [libraryId] of newLibraryIds.values()) {
          dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_props")
            .unobserve(callback);
        }
        dataManagerSubdocs.removeLibraryYDocMapCallback(callback);
      };
    },
    () => {
      const libraryIds = getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap);

      const libraryIdsWithProps = [];
      for (const [libraryId] of libraryIds) {
        libraryIdsWithProps.push([
          libraryId,
          dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_props")
            .toJSON(),
        ]);
      }

      if (
        prevLibraryIdsWithPropsRef.current !== null &&
        prevLibraryIdsWithPropsRef.current !== undefined &&
        equalityDeep(prevLibraryIdsWithPropsRef.current, libraryIdsWithProps)
      ) {
        return prevLibraryIdsWithPropsRef.current;
      } else {
        prevLibraryIdsWithPropsRef.current = libraryIdsWithProps;
        return prevLibraryIdsWithPropsRef.current;
      }
    }
  );

  const sortedLibraryIds = useMemo(
    () => sortArrayWithPropsByOrder([...libraryIdsWithProps]),
    [libraryIdsWithProps]
  );

  const handleLibrarySelect = useCallback(
    (libraryId) => {
      setLibraryId(libraryId);
      setItemId("unselected");
      if (deviceType === "mobile") {
        setPanelOpened(false);
      }
      setPanelOpened(true);
      activatePanel("libraries", "details", [libraryId]);
      setLibraryManagerOpened(false);
    },
    [
      setLibraryId,
      setItemId,
      deviceType,
      setPanelOpened,
      activatePanel,
      setLibraryManagerOpened,
    ]
  );

  const handleCreateLibrary = useCallback(() => {
    const newLibraryId = dataManagerSubdocs.createEmptyLibrary();
    setLibraryId(newLibraryId);
    setupSearchForLibrary(newLibraryId);
    if (deviceType === "mobile") {
      setPanelOpened(false);
    }
    setPanelOpened(true);
    activatePanel("libraries", "details", [newLibraryId]);
    setLibraryManagerOpened(false);
  }, [
    setLibraryId,
    deviceType,
    setPanelOpened,
    activatePanel,
    setLibraryManagerOpened,
  ]);

  const onRenameClick = useCallback(() => {
    const currentTitle = libraryIdsWithProps.find(
      (library) => library[0] === appLibraryId
    )?.[1]?.item_properties?.item_title || "";
    setRenameValue(currentTitle);
    setIsRenaming(true);
  }, [appLibraryId, libraryIdsWithProps]);

  const handleRenameSave = useCallback(() => {
    if (renameValue.trim() && renameValue !== libraryIdsWithProps.find(
      (library) => library[0] === appLibraryId
    )?.[1]?.item_properties?.item_title) {
      const libraryYdoc = dataManagerSubdocs.getLibrary(appLibraryId);
      const libraryProps = libraryYdoc.getMap("library_props");
      const currentProperties = libraryProps.get("item_properties");
      libraryProps.set("item_properties", {
        ...currentProperties,
        item_title: renameValue.trim(),
      });
    }
    setIsRenaming(false);
  }, [renameValue, appLibraryId, libraryIdsWithProps]);

  const handleRenameCancel = useCallback(() => {
    setIsRenaming(false);
  }, []);

  const options = useMemo(() => {
    return [
      {
        label: "Edit",
        icon: (
          <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          activatePanel("libraries", "details", [appLibraryId]);
        },
      },
      {
        label: "Save as archive",
        icon: (
          <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.saveArchive(
            dataManagerSubdocs.getLibrary(appLibraryId)
          );
        }
      },
      {
        label: "Load from archive",
        icon: (
          <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.loadArchive(
            dataManagerSubdocs.getLibrary(appLibraryId)
          );
        }
      },
      {
        isDivider: true
      },

      {
        label: "Rename",
        icon: (
          <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: onRenameClick,
      },
      {
        label: "Delete",
        icon: (
          <span className="icon-[ph--trash-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          console.log("Deleting Library");
          dataManagerSubdocs.destroyLibrary(appLibraryId);

        }
      },
    ];

  }, [appLibraryId, onRenameClick])

  return (
    <div
      id="LibraryDirectoryHeader"
      key="LibraryDirectoryHeader"
      className={`flex items-center justify-start w-full overflow-x-hidden overflow-ellipsis h-fit border flex-col transition-all duration-200 ease-in-out ${libraryManagerOpened
        ? "border-b-appLayoutBorder border-t-transparent border-x-transparent bg-appBackground shadow-appLayoutGentleShadow"
        : "border-transparent bg-transparent"
        }`}
    >
      <div className="h-fit min-h-fit w-full flex items-center justify-center ">
        <div
          className={`h-fit w-full max-w-full py-2 px-1 text-libraryManagerHeaderText text-appLayoutText hover:text-appLayoutHighlight transition-colors duration-100 flex items-center justify-center`}
        >
          <ContextMenuWrapper triggerClassname="grow h-fit min-w-0" options={options}>
            {isRenaming ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSave();
                  } else if (e.key === "Escape") {
                    handleRenameCancel();
                  }
                }}
                onBlur={handleRenameSave}
                className="w-full bg-appLayoutInputBackground px-1 text-appLayoutText text-libraryManagerHeaderText text-center focus:outline-none focus:border-appLayoutFocus"
                autoFocus
              />
            ) : (
              <p className="max-w-full w-full h-fit text-nowrap overflow-hidden text-ellipsis text-center">
                {libraryIdsWithProps.find(
                  (library) => library[0] === appLibraryId
                )?.[1]?.item_properties?.item_title || "Open a Library"}
              </p>
            )}
          </ContextMenuWrapper>

          {appLibraryId != "unselected" && (
            <button
              onClick={() => setLibraryManagerOpened(!libraryManagerOpened)}
              className={`hover:bg-appLayoutInverseHover h-libraryManagerHeaderButtonSize rounded-md w-libraryManagerHeaderButtonSize flex items-center justify-center`}
            >
              <StyledTooltip
                label={libraryManagerOpened ? "Close" : "Change Library"}
                position="bottom"
              >
                <span
                  className={`icon-[heroicons-outline--selector] w-libraryManagerHeaderButtonSize h-libraryManagerHeaderButtonSize`}
                ></span>
              </StyledTooltip>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="w-full"
          key={
            appLibraryId == "unselected" || libraryManagerOpened
              ? "opened"
              : "closed"
          }
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {(appLibraryId == "unselected" || libraryManagerOpened) && (
            <>
              <div className="h-[0.5px] w-full px-2">
                <div className="h-[0.5px] w-full bg-appLayoutBorder"></div>
              </div>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "fit-content", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full overflow-hidden"
              >
                <div className="h-fit w-full grid grid-cols-1 py-1 ">
                  {sortedLibraryIds &&
                    sortedLibraryIds.map(
                      ([libraryId, props]) =>
                        appLibraryId != libraryId && (
                          <LibraryDirectoryHeaderButton
                            key={libraryId}
                            libraryId={libraryId}
                            props={props}
                            onSelect={handleLibrarySelect}
                            onHover={setLibraryHovered}
                            isHovered={libraryHovered === libraryId}
                          />
                        )
                    )}
                </div>

                <button className="text-libraryManagerHeaderText h-libraryDirectoryBookNodeHeight px-2 text-appLayoutTextMuted hover:text-appLayoutHighlight w-full flex items-center gap-1 justify-center hover:bg-appLayoutHover transition-colors duration-100 group cursor-pointer"
                  onClick={handleCreateLibrary}>
                  <div
                    className="h-full w-fit flex items-center justify-center"
                  >
                    <span className="icon-[material-symbols-light--add-2-rounded] w-libraryDirectorySectionNodeIconSize h-libraryDirectorySectionNodeIconSize overflow-hidden"></span>
                  </div>

                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LibraryDirectoryHeader;
