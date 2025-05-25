import { equalityDeep } from "lib0/function";
import useMainPanel from "../../hooks/useMainPanel";
import { mainPanelStore } from "../../stores/mainPanelStore";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { ScrollArea } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";

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

  const setTabs = mainPanelStore((state) => state.setTabs);

  useEffect(() => {
    const newState = JSON.parse(JSON.stringify(mainPanelState));

    if (
      !tabs?.find((value) => {
        return equalityDeep(value, newState);
      })
    ) {
      const newTabs = JSON.parse(JSON.stringify(tabs));

      newTabs.push(newState);
      if (newTabs.length > 10) {
        newTabs.shift();
      }

      setTabs(newTabs);
    }
  }, [mainPanelState, setTabs]);

  return (
    <ScrollArea
      overscrollBehavior="none"
      scrollbars="x"
      type="hover"
      classNames={{
        root: `grow basis-0 min-w-0 h-tabsHeight p-0`,
        scrollbar: `bg-transparent hover:bg-transparent p-0 h-scrollbarSize`,
        thumb: `bg-appLayoutBorder rounded-t-full hover:!bg-appLayoutInverseHover`,
        viewport: `h-full w-full`,
        content: `h-full w-full`,
      }}
    >
      <div className="w-fit min-w-full h-full flex items-center">
        <AnimatePresence>
          {tabs?.map((tab) => {
            const { panelType, mode, breadcrumbs } = tab;

            return (
              <motion.div
                key={
                  breadcrumbs.length >= 1
                    ? breadcrumbs[0] + "-" + breadcrumbs[breadcrumbs.length - 1]
                    : panelType
                }
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: `var(--tabWidth)` }}
                exit={{ opacity: 0, width: 0 }}
                className="h-full"
              >
                <TabButton
                  panelType={panelType}
                  mode={mode}
                  breadcrumbs={breadcrumbs}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        <UnusedSpace />
      </div>
    </ScrollArea>
  );
};

const TabButton = ({ panelType, mode, breadcrumbs, key }) => {
  const dndRef = useRef(null);

  const setFocusedItem = appStore((state) => state.setFocusedItem);

  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setTemplateId = appStore((state) => state.setTemplateId);

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const { activatePanel } = useMainPanel();

  const [label, setLabel] = useState("DEFAULT");
  const [icon, setIcon] = useState(
    <span className="icon-[icon-park-outline--dot] w-full h-full"></span>
  );

  const action = useCallback(() => {
    if (panelType === "libraries") {
      setActivity("libraries");
      setLibraryId(breadcrumbs[0]);
    }

    if (panelType === "templates") {
      setActivity("templates");
    }

    activatePanel(panelType, mode, breadcrumbs);
  }, [panelType, mode, breadcrumbs, activatePanel, setActivity, setLibraryId]);

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

  const [areaSelected, setAreaSelected] = useState("");

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (
        equalityDeep(draggedItem.tabProps, { panelType, mode, breadcrumbs })
      ) {
        setAreaSelected("");
        return;
      }

      const tabDropIndex = tabs.findIndex((x) =>
        equalityDeep(x, { panelType, mode, breadcrumbs })
      );

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const buffer = 0; // pixels to define the top/bottom sensitive area
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const middle = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps)
      );

      if (tabDraggedIndex !== -1) {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          setAreaSelected("left");
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          setAreaSelected("right");
        } else {
          setAreaSelected("");
        }
      } else {
        if (hoverClientX < middle) {
          setAreaSelected("left");
        } else if (hoverClientX >= middle) {
          setAreaSelected("right");
        } else {
          setAreaSelected("");
        }
      }
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (
        equalityDeep(draggedItem.tabProps, { panelType, mode, breadcrumbs })
      ) {
        setAreaSelected("");
        return;
      }

      const tabDropIndex = tabs.findIndex((x) =>
        equalityDeep(x, { panelType, mode, breadcrumbs })
      );

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps)
      );

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const buffer = 0; // pixels to define the top/bottom sensitive area
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const middle = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      if (tabDraggedIndex !== -1) {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          let element = newTabs[tabDraggedIndex];
          newTabs.splice(tabDraggedIndex, 1);
          newTabs.splice(tabDropIndex, 0, element);

          setTabs(newTabs);
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          let element = newTabs[tabDraggedIndex];
          newTabs.splice(tabDraggedIndex, 1);
          newTabs.splice(tabDropIndex + 1, 0, element);

          setTabs(newTabs);
        }
      } else {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          newTabs.splice(tabDropIndex, 0, draggedItem.tabProps);

          setTabs(newTabs);
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          newTabs.splice(tabDropIndex + 1, 0, draggedItem.tabProps);

          setTabs(newTabs);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(dndRef));

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
              .get("item_properties")["item_title"]
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
        setLabel(itemMap.get("item_properties")["item_title"]);
      };

      itemMap.observe(callback);

      callback();

      return () => {
        itemMap?.unobserve(callback);
      };
    } else if (panelType === "templates") {
      setIcon(<span className="icon-[carbon--template] w-full h-full"></span>);
      setLabel(rootId);
    } else if (panelType === "dictionary") {
      setIcon(
        <span className="icon-[material-symbols-light--match-word-rounded] w-full h-full"></span>
      );
      setLabel(rootId);
    } else if (panelType === "settings") {
      setIcon(
        <span className="icon-[material-symbols-light--settings] w-full h-full"></span>
      );
      setLabel("Settings");
    } else if (panelType === "home") {
      setIcon(
        <span className="icon-[material-symbols-light--home] w-full h-full"></span>
      );
      setLabel("Home");
    }
  }, [panelType, breadcrumbs]);

  useEffect(() => {
    if (
      equalityDeep(mainPanelState, {
        panelType,
        mode,
        breadcrumbs,
      })
    ) {
      dndRef.current?.scrollIntoView();
    }
  }, [mainPanelState, breadcrumbs, mode, panelType]);

  return (
    <div
      ref={dndRef}
      className={`h-full w-full flex items-center justify-start gap-1 pr-1
          transition-colors duration-200

          ${isDragging && "opacity-30"} 

          ${
            (!isOverCurrent || (isOverCurrent && areaSelected === "")) &&
            "border-l border-l-transparent border-r border-r-appLayoutBorder"
          }
          
          ${
            isOverCurrent &&
            areaSelected === "left" &&
            `border-r border-r-appLayoutBorder border-l border-l-appLayoutHighlight`
          }
          ${
            isOverCurrent &&
            areaSelected === "right" &&
            `border-l border-l-appLayoutBorder border-r border-r-appLayoutHighlight`
          }
         

          ${
            equalityDeep(mainPanelState, {
              panelType,
              mode,
              breadcrumbs,
            })
              ? "border-t-appLayoutHighlight border-t border-b border-b-transparent"
              : "border-t-transparent border-t border-b border-b-appLayoutBorder hover:bg-appLayoutInverseHover hover:border-t-appLayoutInverseHover "
          }
        `}
    >
      <button
        autoFocus
        onClick={action}
        className={`grow basis-0 min-w-0 h-full flex items-center justify-start focus:-outline-offset-4  focus:outline-appLayoutTextMuted`}
      >
        <span className="w-tabsIconSize h-tabsIconSize p-1 mb-[3px]">
          {icon}
        </span>
        <div className="grow pr-4 basis-0 h-full flex items-center text-nowrap overflow-x-hidden overflow-y-hidden overflow-ellipsis text-tabsFontSize">
          {label}
        </div>
      </button>
      <button
        onClick={() => {
          const newTabs = JSON.parse(JSON.stringify(tabs));
          const tabIndex = tabs.findIndex((x) =>
            equalityDeep(x, { panelType, mode, breadcrumbs })
          );

          newTabs.splice(tabIndex, 1);

          if (newTabs.length > 0) {
            setTabs(newTabs);

            activatePanel(
              newTabs[newTabs.length - 1].panelType,
              newTabs[newTabs.length - 1].mode,
              newTabs[newTabs.length - 1].breadcrumbs
            );
          }
        }}
        className="min-w-tabsIconSize w-tabsIconSize h-tabsIconSize p-[3px] rounded-md hover:text-appLayoutHighlight hover:bg-appLayoutGradientHover"
      >
        <span className="icon-[iwwa--delete] w-full h-full"></span>
      </button>
    </div>
  );
};

const UnusedSpace = () => {
  const dndRef = useRef();

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const [isHovering, setIsHovering] = useState(false);

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (equalityDeep(draggedItem.tabProps, tabs[tabs.length - 1])) {
        setIsHovering(false);
        return;
      }

      setIsHovering(true);
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (equalityDeep(draggedItem.tabProps, tabs[tabs.length - 1])) {
        setIsHovering(false);
        return;
      }

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps)
      );

      if (tabDraggedIndex !== -1) {
        const newTabs = JSON.parse(JSON.stringify(tabs));

        let element = newTabs[tabDraggedIndex];
        newTabs.splice(tabDraggedIndex, 1);
        newTabs.push(element);

        setTabs(newTabs);
      } else {
        const newTabs = JSON.parse(JSON.stringify(tabs));

        newTabs.push(draggedItem.tabProps);

        setTabs(newTabs);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drop(dndRef);

  return (
    <div
      ref={dndRef}
      style={{
        height: "100%",
      }}
      className={`grow basis-0 border-b border-b-appLayoutBorder h-[4rem]
        ${
          isOverCurrent && isHovering
            ? ` border-l border-l-appLayoutHighlight`
            : ""
        }
        `}
    ></div>
  );
};
