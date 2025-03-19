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
import { appStore } from "../../../stores/appStore";
import { wait } from "lib0/promise";
import { setupSearchForLibrary } from "../../../lib/search";

// TODO - Replace all these UseEffects with a singular useSyncExternalStore hook
const LibraryManager = () => {
  console.log("Library Manager was rendered");
  const { deviceType } = useDeviceType();

  const setLibraryId = appStore((state) => state.setLibraryId);
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
    <div
      id="LibraryManagerContainer"
      className={`h-full w-full flex flex-col items-center`}
    >
      <div
        id="LibraryManagerHeader"
        className={`flex items-center justify-start w-full gap-2 px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-appLayoutBorder`}
      >
        {deviceType === "mobile" && (
          <span className="icon-[ion--library-sharp] ml-3 h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize"></span>
        )}

        <h1 className={`h-fit flex-grow pt-1 text-libraryManagerHeaderText text-appLayoutText order-2 ${deviceType === 'mobile' ? 'ml-3' : 'ml-6'}`}>
          Your Libraries
        </h1>

        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize text-appLayoutTextMuted transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
          onClick={() => {
            const newLibraryId = dataManagerSubdocs.createEmptyLibrary();
            setLibraryId(newLibraryId);
            setupSearchForLibrary(newLibraryId);
            if (deviceType === "mobile") {
              setPanelOpened(false);
            }

            setPanelOpened(true);
          }}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      <div className="w-[92.5%] h-px bg-appLayoutBorder"></div>

      <div
        id="LibraryManagerBody"
        className={`flex-grow flex flex-col w-full justify-start items-center overflow-y-scroll pt-1 ${
          deviceType === "mobile" ? "no-scrollbar" : ""
        }`}
        style={{
          paddingLeft: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
        }}
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
                    className="w-full h-libraryManagerNodeHeight min-h-libraryManagerNodeHeight border-appLayoutBorder "
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
