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
import AppThemeDetailsPanel from "../MainPanels/AppThemeDetailsPanel";

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
import DictionaryPanel from "../MainPanels/DictionaryPanel";

const MainPanel = ({ main = true }) => {
  console.log("MainPanel rendering");

  const { deviceType } = useDeviceType();
  const isDesktop = deviceType === "desktop";

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  /* Simplified subscriptions - MainPanel mainly depends on mainPanelState now */
  const libraryId = appStore((state) => state.libraryId);
  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setShowActivityBar = appStore((state) => state.setShowActivityBar);

  const splitMode = mainPanelStore((state) => state.splitMode);
  const splitPanelState = mainPanelStore((state) => state.splitPanelState);

  const { mainPanelState, activatePanel } = useMainPanel();

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
        dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory"),
      )
    ) {
      throw new Error("Tried to access uninitialized directory");
    }

    libraryYTreeRef.current = new YTree(
      dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory"),
    );
    // Only re-initialize YTree if libraryId changes
  }, [libraryId]);

  const renderMainPanel = useCallback(() => {
    const { panelType, mode, breadcrumbs } =
      splitMode == "none" || main ? mainPanelState : splitPanelState;

    const isAtRoot = breadcrumbs.length === 1;

    const rootId = breadcrumbs[0];
    const youngestId = breadcrumbs[breadcrumbs.length - 1];

    if (panelType === "libraries") {
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

      key.current = "templateDetails-" + rootId + "-" + mode;

      const breadcrumbValues = [
        {
          label: "Your Editor Styles",
          action: () => {},
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
    } else if (panelType === "appThemes") {
      key.current = "appThemeDetails-" + rootId;

      const breadcrumbValues = [
        {
          label: "Your App Themes",
          action: () => {},
        },
        {
          label: rootId,
          action: () => {
            activatePanel("appThemes", mode, [rootId]);
          },
        },
      ];

      return (
        <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
          <AppThemeDetailsPanel themeId={rootId} key={rootId} />
        </PrependBreadcrumbs>
      );
    } else if (panelType === "dictionary") {
      key.current = "dictionary";
      return <DictionaryPanel />;
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
    main,
    splitMode,
    splitPanelState
  ]);

  return (
    <div className="w-full min-w-0 basis-0 h-full bg-appBackground overflow-hidden z-3 flex flex-col items-center justify-center">
      {/* <section className="w-full h-actionBarHeight min-h-actionBarHeight flex">
        <TabsBar /> 
        <NotesPanelOpenButton
          isNotesPanelAwake={isNotesPanelAwake}
          refreshNotesPanel={refreshNotesPanel}
        />
      </section> */}
      {isDesktop && (
        <div
          key={key.current}
          className="w-full grow min-h-0 basis-0 overflow-hidden z-3 flex flex-col items-center justify-center"
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
        </div>
      )}

      {!isDesktop && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          key={key.current}
          className="w-full grow min-h-0 basis-0 overflow-hidden z-3 flex flex-col items-center justify-center"
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
      )}
    </div>
  );
};

export default MainPanel;

const PrependBreadcrumbs = ({ breadcrumbValues, children }) => {
  const { deviceType } = useDeviceType();
  const isDesktop = deviceType === "desktop";

  return (
    <>
      {isDesktop && (
        <section className="w-full h-fit py-[5px] px-3 flex items-center justify-start">
          <Breadcrumbs breadcrumbs={breadcrumbValues} />
        </section>
      )}
      <section className="MainPanelShell w-full grow basis-0 overflow-hidden">
        {children}
      </section>
    </>
  );
};
