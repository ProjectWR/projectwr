import { equalityDeep } from "lib0/function";
import useMainPanel from "../../hooks/useMainPanel";
import { mainPanelStore } from "../../stores/mainPanelStore";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { ScrollArea } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";

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
    <ScrollArea
      overscrollBehavior="none"
      scrollbars="x"
      type="hover"
      classNames={{
        root: `w-full h-fit p-0 border-b border-appLayoutBorder`,
        scrollbar: `bg-transparent hover:bg-transparent p-0 h-scrollbarSize`,
        thumb: `bg-appLayoutBorder rounded-t-full hover:bg-appLayoutInverseHover`,
      }}
    >
      <div className="w-fit h-fit flex items-center">
        {tabs?.map((tab) => {
          const { panelType, mode, breadcrumbs } = tab;

          return (
            <TabButton
              key={
                breadcrumbs.length >= 1
                  ? breadcrumbs[0] + "-" + breadcrumbs[breadcrumbs.length - 1]
                  : panelType
              }
              panelType={panelType}
              mode={mode}
              breadcrumbs={breadcrumbs}
              onClick={() => {
                console.log("CLICKED");
              }}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

const TabButton = ({ onClick, panelType, mode, breadcrumbs }) => {
  const { activatePanel } = useMainPanel();

  const [label, setLabel] = useState("DEFAULT");
  const action = useCallback(() => {
    activatePanel(panelType, mode, breadcrumbs);
  }, [panelType, mode, breadcrumbs, activatePanel]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: () => {
      if (panelType === "libraries") {
        return {
          appItemType: "libraries",
          id: breadcrumbs[breadcrumbs.length - 1],
          libraryId: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "templates") {
        return {
          appItemType: "templates",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "dictionary") {
        return {
          appItemType: "dictionary",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "settings") {
        return {
          appItemType: "settings",
          id: null,
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "home") {
        return {
          appItemType: "home",
          id: null,
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [areaSelected, setAreaSelected] = useState("left");

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {},
    drop: (draggedItem, monitor) => {},
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  useEffect(() => {
    const rootId = breadcrumbs[0];
    const youngestId = breadcrumbs[breadcrumbs.length - 1];
    const isAtRoot = youngestId === rootId;

    if (panelType === "libraries") {
      if (isAtRoot) {
        const callback = () => {
          setLabel(
            dataManagerSubdocs
              .getLibrary(rootId)
              .getMap("library_props")
              .get("library_name")
          );
        };

        dataManagerSubdocs
          .getLibrary(rootId)
          .getMap("library_props")
          .observe(callback);

        callback();

        return () => {
          dataManagerSubdocs
            .getLibrary(rootId)
            .getMap("library_props")
            .unobserve(callback);
        };
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

      const callback = () => {
        setLabel(itemMap.get("item_title"));
      };

      itemMap.observe(callback);

      callback();

      return () => {
        itemMap?.unobserve(callback);
      };
    }
  }, [panelType, breadcrumbs]);

  return (
    <div className="w-[12rem] h-[2.5rem] px-1 flex items-center justify-start border-x border-appLayoutBorder hover:bg-appLayoutInverseHover">
      <button
        onClick={action}
        className={`grow px-1 min-h-0 text-nowrap overflow-x-hidden overflow-x-ellipsis basis-0 h-full flex items-center justify-start`}
      >
        {label}
      </button>
      <button
        onClick={() => {
          console.log("DELETING TAB");
        }}
        className="w-[2rem] h-[2rem] rounded-md p-1 hover:text-appLayoutHighlight hover:bg-appLayoutGradientHover"
      >
        <span className="icon-[iwwa--delete] w-full h-full"></span>
      </button>
    </div>
  );
};
