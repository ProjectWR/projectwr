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

const MainPanel = ({}) => {
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
  const itemId = appStore((state) => state.itemId);
  const itemMode = appStore((state) => state.itemMode);

  const templateId = appStore((state) => state.templateId);
  const templateMode = appStore((state) => state.templateMode);

  const dictionaryWord = appStore((state) => state.dictionaryWord);
  const dictionaryMode = appStore((state) => state.dictionaryMode);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);

  const activity = appStore((state) => state.activity);

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
    console.log("MAIN PANEL STATE", mainPanelState);
    const { panelType, mode, breadcrumbs } = mainPanelState;

    console.log(panelType, mode, breadcrumbs);

    const isAtRoot = breadcrumbs.length === 1;

    const rootId = breadcrumbs[0];
    const youngestId = breadcrumbs[breadcrumbs.length - 1];

    if (panelType === "libraries") {
      const breadcrumbValues = [
        {
          label: "Your Libraries",
          action: () => {},
        },
        {
          label: dataManagerSubdocs
            .getLibrary(rootId)
            .getMap("library_props")
            .get("library_name"),
          action: () => {
            activatePanel("libraries", "details", [rootId]);
          },
        },
      ];

      if (isAtRoot) {
        key.current = "libraryDetails-" + rootId;
        return (
          <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
            <LibraryDetailsPanel libraryId={rootId} />{" "}
          </PrependBreadcrumbs>
        );
      }

      key.current = "itemDetails-" + youngestId + "-" + mode;

      if (
        !checkForYTree(
          dataManagerSubdocs.getLibrary(rootId).getMap("library_directory")
        )
      ) {
        throw new Error("Tried to access uninitialized directory");
      }

      const libraryYTree = new YTree(
        dataManagerSubdocs.getLibrary(rootId).getMap("library_directory")
      );

      const itemMap = libraryYTree.getNodeValueFromKey(youngestId);

      console.log("ITEM MAP", itemMap);

      const ancestors = [rootId];

      for (let i = 1; i < breadcrumbs.length; i++) {
        const breadcrumb = breadcrumbs[i];
        ancestors.push(breadcrumb);

        console.log("ANCESTORS: ", ancestors);

        const breadcrumbItemMap = libraryYTree.getNodeValueFromKey(breadcrumb);

        const valueBreadcrumbs = [...ancestors];

        breadcrumbValues.push({
          label: breadcrumbItemMap.get("item_title"),
          action: () => {
            console.log(
              "ACTIVATING PANEL",
              breadcrumbItemMap.get("item_title", valueBreadcrumbs)
            );
            activatePanel("libraries", "details", valueBreadcrumbs);
          },
        });
      }

      console.log("breadcrumb values: ", breadcrumbValues);

      if (itemMap) {
        if (itemMap.get("type") === "book") {
          return (
            <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
              <BookDetailsPanel
                ytree={libraryYTree}
                bookId={youngestId}
                key={youngestId}
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
                />
              </PrependBreadcrumbs>
            );
          }

          if (mode === "settings") {
            return (
              <PrependBreadcrumbs breadcrumbValues={breadcrumbValues}>
                <PaperSettingsPanel
                  ytree={libraryYTreeRef}
                  paperId={youngestId}
                />
              </PrependBreadcrumbs>
            );
          }
        }
      }
    } else if (panelType === "templates") {
      key.current = "templateDetails-" + rootId + "-" + mode;

      if (mode === "details") {
        return <TemplateDetailsPanel templateId={rootId} key={rootId} />;
      }
      if (mode === "preview") {
        return <TemplateViewPanel templateId={rootId} key={rootId} />;
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
  }, [mainPanelState, activatePanel]);

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
    <AnimatePresence mode="wait">
      <motion.div
        key={key.current}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -10, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="w-full h-full overflow-hidden z-3 flex flex-col items-center justify-center"
      >
        {renderMainPanel()}
      </motion.div>
    </AnimatePresence>
  );
};

export default MainPanel;

const PrependBreadcrumbs = ({ breadcrumbValues, children }) => {
  return (
    <>
      <section className="w-full h-fit py-[5px] px-3 flex items-center justify-start">
        <Breadcrumbs breadcrumbs={breadcrumbValues} />{" "}
      </section>
      <section className="MainPanelShell, w-full grow basis-0 overflow-hidden">
        {children}
      </section>
    </>
  );
};
