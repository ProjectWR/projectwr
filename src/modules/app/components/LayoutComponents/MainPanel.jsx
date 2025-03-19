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
import { templateStore } from "../../stores/templateStore";
import TemplateViewPanel from "../MainPanels/TemplateViewPanel";
import TemplateDetailsPanel from "../MainPanels/TemplateDetailsPanel";
import HomePanel from "../MainPanels/HomePanel";

const MainPanel = ({}) => {
  const { deviceType } = useDeviceType();
  const libraryId = appStore((state) => state.libraryId);
  const itemId = appStore((state) => state.itemId);
  const itemMode = appStore((state) => state.itemMode);

  const templateId = templateStore((state) => state.templateId);
  const templateMode = templateStore((state) => state.templateMode);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);

  const activity = appStore((state) => state.activity);

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

      key.current = "empty";
      return <HomePanel />;
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

      key.current = "empty";
      return <HomePanel />;
    }

    if (activity === "settings") {
      key.current = "settings";
      return <SettingsPanel />;
    }

    key.current = "empty";
    return <HomePanel />;
  }, [libraryId, activity, itemId, itemMode, templateId, templateMode]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key.current}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -10, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="w-full h-full bg-appBackground overflow-hidden z-3 flex justify-center"
      >
        {renderMainPanel()}
      </motion.div>
    </AnimatePresence>
  );
};

export default MainPanel;
