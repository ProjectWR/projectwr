import { equalityDeep } from "lib0/function";
import useMainPanel from "../../hooks/useMainPanel";
import { mainPanelStore } from "../../stores/mainPanelStore";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";

export const TabsBar = () => {
  /**
   * @type {MainPanelState}
   * @typedef {Object} MainPanelState
   * @property {string} panelType - The current panel type (e.g., "home").
   * @property {*} mode - The current mode of the panel (can be null or specific mode).
   * @property {Array} breadcrumbs - An array of breadcrumb strings representing the navigation path.
   */
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const { activatePanel } = useMainPanel();

  console.log("TABS: ", tabs);

  console.log("MAIN PANEL STATE: ", mainPanelState);

  console.log(
    "CAN MAIN PANEL STATE BE FOUND IN TABS: ",
    tabs?.find((value) => {
      return equalityDeep(value, mainPanelState);
    })
  );

  return (
    <div className="w-full h-[3rem] flex items-center">
      {tabs?.map((tab) => {
        const { panelType, breadcrumbs } = tab;

        const rootId = breadcrumbs[0];
        const youngestId = breadcrumbs[breadcrumbs.length - 1];

        const isAtRoot = tab.length === 1;

        if (panelType === "libraries") {
          if (isAtRoot) {
            const key = "libraryDetails-" + rootId;

            return (
              <div className="w-[12rem] h-full" key={key}>
                {dataManagerSubdocs
                  .getLibrary(rootId)
                  .getMap("library_props")
                  .get("library_name")}
              </div>
            );
          }

          if (
            !dataManagerSubdocs.getLibrary(rootId) ||
            !checkForYTree(
              dataManagerSubdocs.getLibrary(rootId).getMap("library_directory")
            )
          ) {
            return null;
          }

          const ytree = new YTree(
            dataManagerSubdocs.getLibrary(rootId).getMap("library_directory")
          );

          const itemMap = ytree.getNodeValueFromKey(youngestId);

          const key = "libraryDetails-" + rootId + "-" + youngestId;

          return (
            <div className="w-[12rem] h-full" key={key}>
              {itemMap.get("item_title")}
            </div>
          );
        }
      })}
    </div>
  );
};
