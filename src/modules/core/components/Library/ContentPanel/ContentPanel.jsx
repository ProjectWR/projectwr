import { pageStore } from "../../../stores/pageStore";
import BookDetailsPanel from "./BookDetailsPanel";
import Home from "../Home";
import PaperDetailsPanel from "./PaperPanel";
import SectionDetailsPanel from "./SectionDetailsPanel";
import LibraryDetailsPanel from "./LibraryDetailsPanel";

const ContentPanel = () => {
  console.log("content panel rendering");
  const contentPanel = pageStore((state) => state.contentPanel);
  const activeLibraryItemEntryReference = pageStore(
    (state) => state.activeLibraryItemEntryReference
  );
  return (
    <>
      {contentPanel === "home" && <Home />}

      {contentPanel === "settings" && <p>settings</p>}

      {contentPanel === "createLibrary" && (
        <LibraryDetailsPanel
          libraryEntryReference={activeLibraryItemEntryReference}
        />
      )}

      {contentPanel === "createBook" && (
        <BookDetailsPanel
          bookEntryReference={activeLibraryItemEntryReference}
        />
      )}

      {contentPanel === "createSection" && (
        <SectionDetailsPanel
          sectionEntryReference={activeLibraryItemEntryReference}
        />
      )}

      {contentPanel === "createPaper" && (
        <PaperDetailsPanel
          paperEntryReference={activeLibraryItemEntryReference}
        />
      )}
    </>
  );
};

export default ContentPanel;
