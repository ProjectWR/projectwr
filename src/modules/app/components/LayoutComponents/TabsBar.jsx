import { equalityDeep } from "lib0/function";
import useMainPanel from "../../hooks/useMainPanel";
import { mainPanelStore } from "../../stores/mainPanelStore";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { ScrollArea } from "@mantine/core";

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
    <ScrollArea overscrollBehavior="none" scrollbars="x" type="hover"  classNames={{
      root: `w-full h-fit p-0 border-b border-appLayoutBorder`,
      scrollbar: `bg-transparent hover:bg-transparent p-0 h-scrollbarSize`,
      thumb: `bg-appLayoutBorder rounded-t-full hover:bg-appLayoutInverseHover`
    }}>
      <div className="w-fit h-fit flex items-center">
        {tabs?.map((tab) => {
          const { panelType, breadcrumbs } = tab;

          const rootId = breadcrumbs[0];
          const youngestId = breadcrumbs[breadcrumbs.length - 1];

          const isAtRoot = youngestId === rootId;

          if (panelType === "libraries") {
            if (isAtRoot) {
              const key = "libraryDetails-" + rootId;

              return (
                <TabButton
                  key={key}
                  label={dataManagerSubdocs
                    .getLibrary(rootId)
                    .getMap("library_props")
                    .get("library_name")}
                  onClick={() => {
                    console.log("CLICKED");
                  }}
                />
              );
            }

            if (
              !dataManagerSubdocs.getLibrary(rootId) ||
              !checkForYTree(
                dataManagerSubdocs
                  .getLibrary(rootId)
                  .getMap("library_directory")
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
              <TabButton
                key={key}
                label={itemMap.get("item_title")}
                onClick={() => {
                  console.log("CLICKED");
                }}
              />
            );
          }
        })}
      </div>
    </ScrollArea>
  );
};

const TabButton = ({ label, onClick }) => {
  return (
    <div className="w-[12rem] h-[2.5rem] flex items-center justify-start border-x border-appLayoutBorder hover:bg-appLayoutInverseHover">
      <button
        onClick={onClick}
        className={`grow basis-0 h-full flex items-center justify-start`}
      >
        {label}
      </button>
      <button
        onClick={() => {
          console.log("DELETE TAB!");
        }}
        className="w-[2rem] h-full p-1 hover:text-appLayoutHighlight hover:bg-appLayoutGradientHover"
      >
        <span className="icon-[iwwa--delete] w-full h-full"></span>
      </button>
    </div>
  );
};
