import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import BookDetailsPanel from "../MainPanels/BookDetailsPanel";
import SectionDetailsPanel from "../MainPanels/SectionDetailsPanel";
import LibraryDetailsPanel from "../MainPanels/LibraryDetailsPanel";
import PaperPanel from "../MainPanels/PaperPanel";
import SettingsPanel from "../MainPanels/SettingsPanel";
import PaperSettingsPanel from "../MainPanels/PaperSettingsPanel";
import TemplateViewPanel from "../MainPanels/TemplateViewPanel";
import TemplateDetailsPanel from "../MainPanels/TemplateDetailsPanel";
import HomePanel from "../MainPanels/HomePanel";
import DictionaryCreatePanel from "../MainPanels/DictionaryCreatePanel";
import DictionaryDetailsPanel from "../MainPanels/DictionaryDetailsPanel";
import useMainPanel from "../../hooks/useMainPanel";
import useStoreHistory from "../../hooks/useStoreHistory";
import { Breadcrumbs } from "./Breadcrumbs";
import templateManager from "../../lib/templates";
import { getAncestorsForBreadcrumbs } from "../../lib/util";
import { TabsBar } from "./TabsBar";
import NoteDetailsPanel from "../MainPanels/NoteDetailsPanel";
import { ErrorBoundary } from "react-error-boundary";
import { DetailsPanelButtonOnClick } from "./DetailsPanel/DetailsPanelSubmitButton";
import { mainPanelStore } from "../../stores/mainPanelStore";
import { equalityDeep } from "lib0/function";
import { getOrInitLibraryYTree } from "../../lib/ytree";

const MainPanel = ({ isNotesPanelAwake, refreshNotesPanel }) => {
  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const mainPanelPreviousRef = useRef(null);

  const libraryId = appStore((state) => state.libraryId);
  const setActivity = appStore((state) => state.setActivity);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setFocusedItem = appStore((state) => state.setFocusedItem);

  const itemId = appStore((state) => state.itemId);
  const itemMode = appStore((state) => state.itemMode);

  const templateId = appStore((state) => state.templateId);
  const templateMode = appStore((state) => state.templateMode);

  const setTemplateId = appStore((state) => state.setTemplateId);

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const dictionaryWord = appStore((state) => state.dictionaryWord);
  const dictionaryMode = appStore((state) => state.dictionaryMode);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);

  const activity = appStore((state) => state.activity);

  const setNotesPanelState = appStore((state) => state.setNotesPanelState);

  const notesScopeLibraryIdRef = useRef(null);

  const { mainPanelState, activatePanel } = useMainPanel();

  useEffect(() => {
    const { panelType, mode, breadcrumbs } = mainPanelState;
    if (panelType === "libraries") {
      const libraryId = breadcrumbs[0];

      if (
        notesScopeLibraryIdRef.current === null ||
        notesScopeLibraryIdRef.current !== libraryId
      ) {
        notesScopeLibraryIdRef.current = libraryId;
        setNotesPanelState({ libraryId: libraryId, itemId: "root" });
      }
    }
  }, [mainPanelState, setNotesPanelState]);

  const key = useRef("empty");

  /** @type {{current: YTree}} */
  const libraryYTreeRef = useRef(null);

  useEffect(() => {
    if (libraryId === "unselected") {
      libraryYTreeRef.current = null;
      return;
    }

    if (
      !checkForYTree(
        dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
      )
    ) {
      throw new Error("Tried to access uninitialized directory");
    }

    libraryYTreeRef.current = new YTree(
      dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
    );
  }, [libraryId, activity, itemId, itemMode, templateId, templateMode]);

  const renderMainPanel = useCallback(() => {
    const { panelType, mode, breadcrumbs } = mainPanelState;

    const isAtRoot = breadcrumbs.length === 1;

    const rootId = breadcrumbs[0];
    const youngestId = breadcrumbs[breadcrumbs.length - 1];

    if (panelType === "libraries") {
      setFocusedItem({
        type: "libraries",
        libraryId: rootId,
        itemId: isAtRoot ? null : youngestId,
      });

      const breadcrumbValues = [
        {
          label: "Your Libraries",
          action: () => {
            setActivity("libraries");
            setPanelOpened(true);
            setLibraryId("unselected");
          },
        },
        {
          label: dataManagerSubdocs
            .getLibrary(rootId)
            .getMap("library_props")
            .get("item_properties")["item_title"],
          action: () => {
            activatePanel("libraries", "details", [rootId]);
          },
        },
      ];
      
      const libraryYTree = getOrInitLibraryYTree(rootId);

      if (isAtRoot) {
        key.current = "libraryDetails-" + rootId;
        return (
          <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
            <LibraryDetailsPanel libraryId={rootId} ytree={libraryYTree} />{" "}
          </PrependBreadcrumbs>
        );
      }

      key.current = "itemDetails-" + youngestId + "-" + mode;

      const ancestorIds = getAncestorsForBreadcrumbs(rootId, youngestId);

      const itemMap = libraryYTree.getNodeValueFromKey(youngestId);

      for (let i = 1; i < ancestorIds.length; i++) {
        const breadcrumb = ancestorIds[i];

        const breadcrumbItemMap = libraryYTree.getNodeValueFromKey(breadcrumb);

        breadcrumbValues.push({
          label: breadcrumbItemMap.get("item_properties")["item_title"],
          action: () => {
            activatePanel("libraries", "details", [rootId, breadcrumb]);
          },
        });
      }

      if (itemMap) {
        if (itemMap.get("type") === "book") {
          return (
            <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
              <BookDetailsPanel
                ytree={libraryYTree}
                bookId={youngestId}
                key={youngestId}
                libraryId={rootId}
              />
            </PrependBreadcrumbs>
          );
        }

        if (itemMap.get("type") === "section") {
          return (
            <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
              <SectionDetailsPanel
                ytree={libraryYTree}
                sectionId={youngestId}
                key={youngestId}
                libraryId={rootId}
              />
            </PrependBreadcrumbs>
          );
        }

        if (itemMap.get("type") === "paper") {
          if (mode === "details") {
            return (
              <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
                <PaperPanel
                  ytree={libraryYTree}
                  paperId={youngestId}
                  key={youngestId}
                  libraryId={rootId}
                />
              </PrependBreadcrumbs>
            );
          }

          if (mode === "settings") {
            return (
              <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
                <PaperSettingsPanel
                  libraryId={rootId}
                  ytree={libraryYTree}
                  paperId={youngestId}
                  key={youngestId}
                />
              </PrependBreadcrumbs>
            );
          }
        }

        if (itemMap.get("type") === "note") {
          if (mode === "details") {
            return (
              <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
                <NoteDetailsPanel
                  ytree={libraryYTree}
                  noteId={youngestId}
                  key={youngestId}
                  libraryId={rootId}
                />
              </PrependBreadcrumbs>
            );
          }
        }
      }
    } else if (panelType === "templates") {
      // setActivity("templates");
      setTemplateId(rootId);
      key.current = "templateDetails-" + rootId + "-" + mode;

      const breadcrumbValues = [
        {
          label: "Your Editor Styles",
          action: () => {
            setActivity("templates");
            setPanelOpened(true);
          },
        },
        {
          label: rootId,
          action: () => {
            activatePanel("templateId", mode, [rootId]);
          },
        },
      ];

      if (mode === "details") {
        return (
          <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
            <TemplateDetailsPanel templateId={rootId} key={rootId} />
          </PrependBreadcrumbs>
        );
      }
      if (mode === "preview") {
        return (
          <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
            <TemplateViewPanel templateId={rootId} key={rootId} />;
          </PrependBreadcrumbs>
        );
      }
    } else if (panelType === "dictionary") {
      if (mode === "create") {
        key.current = "Dictionary-" + mode;
        return <DictionaryCreatePanel />;
      }

      if (mode === "details") {
        key.current = "Dictionary-" + rootId + "-" + mode;
        return <DictionaryDetailsPanel word={rootId} />;
      }
    } else if (panelType === "settings") {
      key.current = "settings";
      return <SettingsPanel />;
    } else if (panelType === "home") {
      key.current = "home";
      return <HomePanel />;
    }

    return null;
  }, [
    mainPanelState,
    activatePanel,
    setActivity,
    setPanelOpened,
    setLibraryId,
    setFocusedItem,
    setTemplateId,
  ]);

  const renderMainPanelOld = useCallback(() => {
    if (activity === "libraries") {
      if (libraryId !== "unselected") {
        if (itemId !== "unselected") {
          key.current = "itemDetails-" + itemId + "-" + itemMode;

          if (!libraryYTreeRef.current) {
            if (
              !checkForYTree(
                dataManagerSubdocs
                  .getLibrary(libraryId)
                  .getMap("library_directory")
              )
            ) {
              throw new Error("Tried to access uninitialized directory");
            }

            libraryYTreeRef.current = new YTree(
              dataManagerSubdocs
                .getLibrary(libraryId)
                .getMap("library_directory")
            );
          }

          const itemMap = libraryYTreeRef.current.getNodeValueFromKey(itemId);

          if (itemMap) {
            if (itemMap.get("type") === "book") {
              return (
                <BookDetailsPanel
                  ytree={libraryYTreeRef.current}
                  bookId={itemId}
                  key={itemId}
                />
              );
            }

            if (itemMap.get("type") === "section") {
              return (
                <SectionDetailsPanel
                  ytree={libraryYTreeRef.current}
                  sectionId={itemId}
                  key={itemId}
                />
              );
            }

            if (itemMap.get("type") === "paper") {
              if (itemMode === "details") {
                return (
                  <PaperPanel
                    ytree={libraryYTreeRef.current}
                    paperId={itemId}
                    key={itemId}
                  />
                );
              }

              if (itemMode === "settings") {
                return (
                  <PaperSettingsPanel
                    ytree={libraryYTreeRef.current}
                    paperId={itemId}
                  />
                );
              }
            }
          }
        }

        key.current = "libraryDetails-" + libraryId;
        return <LibraryDetailsPanel libraryId={libraryId} />;
      }

      // key.current = "empty";
      // return <HomePanel />;
    }

    if (activity === "templates") {
      if (templateId !== "unselected") {
        key.current = "templateDetails-" + templateId + "-" + templateMode;
        if (templateMode === "details") {
          return (
            <TemplateDetailsPanel templateId={templateId} key={templateId} />
          );
        }
        if (templateMode === "preview") {
          return <TemplateViewPanel templateId={templateId} key={templateId} />;
        }
      }

      // key.current = "empty";
      // return <HomePanel />;
    }

    if (activity === "dictionary") {
      if (dictionaryMode === "create") {
        key.current = "Dictionary-" + dictionaryMode;
        return <DictionaryCreatePanel />;
      }

      if (dictionaryMode === "details") {
        key.current = "Dictionary-" + dictionaryWord + "-" + dictionaryMode;
        return <DictionaryDetailsPanel word={dictionaryWord} />;
      }

      // key.current = "empty";
      // return <HomePanel />;
    }

    if (activity === "settings") {
      key.current = "settings";
      return <SettingsPanel />;
    }

    if (activity === "home") {
      key.current = "home";
      return <HomePanel />;
    }

    return null;
  }, [
    libraryId,
    activity,
    itemId,
    itemMode,
    templateId,
    templateMode,
    dictionaryMode,
    dictionaryWord,
  ]);

  const renderProxyOld = useCallback(() => {
    const mainPanel = renderMainPanel();

    if (mainPanel) {
      mainPanelPreviousRef.current = { key: key.current, mainPanel: mainPanel };
      return mainPanelPreviousRef.current.mainPanel;
    } else if (mainPanelPreviousRef.current) {
      return mainPanelPreviousRef.current.mainPanel;
    } else {
      return null;
    }
  }, [renderMainPanel]);

  return (
    <motion.div className="w-full h-full overflow-hidden z-3 flex flex-col items-center justify-center">
      <section className="w-full h-tabsHeight flex">
        <TabsBar />
        <NotesPanelOpenButton
          isNotesPanelAwake={isNotesPanelAwake}
          refreshNotesPanel={refreshNotesPanel}
        />
      </section>
      <AnimatePresence mode="wait">
        <motion.div
          key={key.current}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 15, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="w-full grow basis-0 overflow-hidden z-3 flex flex-col items-center justify-center"
        >
          <ErrorBoundary
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                Something went wrong
              </div>
            }
          >
            {renderMainPanel()}
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default MainPanel;

const PrependBreadcrumbs = ({ breadcrumbValues, children }) => {
  return (
    <>
      <section className="w-full h-fit py-[5px] px-3 flex items-center justify-start">
        <Breadcrumbs breadcrumbs={breadcrumbValues} />{" "}
      </section>
      <section className="MainPanelShell w-full grow basis-0 overflow-hidden">
        {children}
      </section>
    </>
  );
};

const NotesPanelOpenButton = ({ isNotesPanelAwake, refreshNotesPanel }) => {
  const setNotesPanelOpened = appStore((state) => state.setNotesPanelOpened);
  const notesPanelOpened = appStore((state) => state.notesPanelOpened);
  const isMd = appStore((state) => state.isMd);

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  const { panelType } = mainPanelState;

  return (
    <AnimatePresence>
      {panelType === "libraries" && (
        <motion.button
          initial={{ width: 0 }}
          animate={{ width: "var(--tabsHeight)" }}
          exit={{ width: 0 }}
          onClick={() => {
            if (isMd) {
              setNotesPanelOpened(!notesPanelOpened);
            } else {
              if (!(notesPanelOpened && isNotesPanelAwake)) {
                setNotesPanelOpened(true);
                refreshNotesPanel();
              }
            }
          }}
          className={`h-full rounded-none hover:bg-appLayoutHover hover:text-appLayoutHighlight border-b border-appLayoutBorder flex items-center justify-center`}
        >
          {notesPanelOpened && (isMd || isNotesPanelAwake) ? (
            <span className="icon-[solar--telescope-bold] w-[75%] h-[75%]"></span>
          ) : (
            <span className="icon-[solar--telescope-bold-duotone] w-[75%] h-[75%]"></span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
};
