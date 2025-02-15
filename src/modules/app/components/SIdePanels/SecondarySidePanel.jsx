import { pageStore } from "../../stores/pageStore";
import LibraryManager from "./LibraryManager/LibraryManager";
import LibrarySidePanel from "./LibrarySidePanel";

const SecondarySidePanel = () => {
  const secondarySidePanel = pageStore((state) => state.secondarySidePanel);

  return (
    <>
      {secondarySidePanel === "libraryManager" && <LibraryManager />}
      {secondarySidePanel === "library" && <LibrarySidePanel />}
      {secondarySidePanel === "templates" && <div>Templates</div>}
      {secondarySidePanel === "history" && <div>History</div>}
    </>
  );
};

export default SecondarySidePanel;
