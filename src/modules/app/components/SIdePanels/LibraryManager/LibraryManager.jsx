import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  sortArrayByOrder,
  sortArrayWithPropsByOrder,
} from "../../../utils/orderUtil";
import LibraryManagerNode from "./LibraryManagerNode";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import { YMapEvent } from "yjs";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { useY } from "react-yjs";
import { equalityDeep, equalityFlat } from "lib0/function";
import { libraryStore } from "../../../stores/libraryStore";
import { appStore } from "../../../stores/appStore";
import { wait } from "lib0/promise";

// TODO - Replace all these UseEffects with a singular useSyncExternalStore hook
const LibraryManager = () => {
  console.log("Library Manager was rendered");
  const { deviceType } = useDeviceType();

  const setLibraryId = libraryStore((state) => state.setLibraryId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const prevLibraryIdsWithPropsRef = useRef(null);

  const libraryIdsWithProps = useSyncExternalStore(
    (callback) => {
      dataManagerSubdocs.addLibraryYDocMapCallback(callback);
      const libraryIds = getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap);
      for (const [libraryId] of libraryIds.values()) {
        dataManagerSubdocs
          .getLibrary(libraryId)
          .getMap("library_props")
          .observe(callback);
      }

      return () => {
        const newLibraryIds = getArrayFromYDocMap(
          dataManagerSubdocs.libraryYDocMap
        );
        for (const [libraryId] of newLibraryIds.values()) {
          dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_props")
            .unobserve(callback);
        }
        dataManagerSubdocs.removeLibraryYDocMapCallback(callback);
      };
    },
    () => {
      const libraryIds = getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap);

      const libraryIdsWithProps = [];
      for (const [libraryId] of libraryIds) {
        libraryIdsWithProps.push([
          libraryId,
          dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_props")
            .toJSON(),
        ]);
      }

      if (
        prevLibraryIdsWithPropsRef.current !== null &&
        prevLibraryIdsWithPropsRef.current !== undefined &&
        equalityDeep(prevLibraryIdsWithPropsRef.current, libraryIdsWithProps)
      ) {
        return prevLibraryIdsWithPropsRef.current;
      } else {
        prevLibraryIdsWithPropsRef.current = libraryIdsWithProps;
        return prevLibraryIdsWithPropsRef.current;
      }
    }
  );

  const sortedLibraryIds = useMemo(
    () => sortArrayWithPropsByOrder([...libraryIdsWithProps]),
    [libraryIdsWithProps]
  );

  return (
    <div id="LibraryManagerContainer" className={`h-full w-full flex flex-col`}>
      <div
        id="LibraryManagerHeader"
        className={`flex items-center justify-start gap-2 px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder`}
        style={{
          boxShadow:
            deviceType === "desktop"
              ? "0 1px 6px -1px hsl(var(--appLayoutShadow))"
              : "", // bottom shadow
          clipPath: deviceType === "desktop" ? "inset(0 0 -10px 0)" : "", // Clip the shadow except at bottom
        }}
      >
        <span className="icon-[ion--library-sharp] ml-3 h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize"></span>

        <h1 className="h-fit flex-grow pt-1 text-libraryManagerHeaderText text-neutral-300 order-2">
          Your Libraries
        </h1>

        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize text-appLayoutTextMuted transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
          onClick={() => {
            setLibraryId(dataManagerSubdocs.createEmptyLibrary());
            if (deviceType === "mobile") {
              setPanelOpened(false);
            }

            setPanelOpened(true);
          }}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      <div
        id="LibraryManagerBody"
        className={`flex-grow flex flex-col w-full justify-start items-center overflow-y-auto ${
          deviceType === "mobile" ? "no-scrollbar" : ""
        }`}
      >
        <div
          id="LibraryListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        >
          {sortedLibraryIds.length > 0 &&
            sortedLibraryIds.map(
              ([libraryId], index) =>
                dataManagerSubdocs.getLibrary(libraryId) && (
                  <div
                    key={libraryId}
                    id={`LibraryListNode-${index}`}
                    className="w-full h-libraryManagerNodeHeight min-h-libraryManagerNodeHeight border-b border-appLayoutBorder "
                  >
                    <LibraryManagerNode
                      libraryId={libraryId}
                      className=""
                      key={libraryId}
                    />
                  </div>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default LibraryManager;
