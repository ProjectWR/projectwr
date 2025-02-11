import { useCallback, useEffect, useState } from "react";
import { sortArrayByOrder } from "../../../utils/orderUtil";
import LibraryManagerNode from "./LibraryManagerNode";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import { YMapEvent } from "yjs";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";


// TODO - Replace all these UseEffects with a singular useSyncExternalStore hook
const LibraryManager = () => {
  const { deviceType } = useDeviceType();

  const [libraryIds, setLibraryIds] = useState(
    getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
  );

  const [sortedLibraryIds, setSortedLibraryIds] = useState(
    sortArrayByOrder([...libraryIds])
  );

  const handleLibraryYDocMapChange = useCallback((action, key, value) => {
    console.log(
      `Change detected: Action = ${action}, Key = ${key}, Value =`,
      value
    );

    setLibraryIds(getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap));
  }, []);

  useEffect(() => {
    handleLibraryYDocMapChange();
    dataManagerSubdocs.addLibraryYDocMapCallback(handleLibraryYDocMapChange);

    return () => {
      dataManagerSubdocs.removeLibraryYDocMapCallback(
        handleLibraryYDocMapChange
      );
    };
  }, [handleLibraryYDocMapChange]);

  useEffect(() => {
    setSortedLibraryIds(
      sortArrayByOrder(getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap))
    );
    /**
     *
     * @param {YMapEvent} event
     */
    const callback = (event) => {
      console.log("CALLBACKED!!");
      if (!event.changes.keys.has("order_index")) return;

      setSortedLibraryIds(
        sortArrayByOrder(getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap))
      );
      console.log("sorted library ids: ", sortedLibraryIds);
    };

    console.log("libraryIDs: ", libraryIds, dataManagerSubdocs.libraryYDocMap);

    for (const [libraryId] of libraryIds.values()) {
      console.log(
        dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
      );

      dataManagerSubdocs
        .getLibrary(libraryId)
        .getMap("library_props")
        .observe(callback);
    }

    return () => {
      for (const [libraryId] of libraryIds.values()) {
        dataManagerSubdocs
          .getLibrary(libraryId)
          .getMap("library_props")
          .unobserve(callback);
      }
    };
  }, [libraryIds]);

  return (
    <div id="LibraryManagerContainer" className={`h-full w-full flex flex-col`}>
      <div
        id="LibraryManagerHeader"
        className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow`}
      >
        <h1 className="h-fit w-fit pt-1 pb-[0.38rem] ml-4 text-libraryManagerHeaderText text-neutral-300 order-2">
          Your Libraries
        </h1>
        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
          onClick={() => {
            dataManagerSubdocs.createEmptyLibrary();
          }}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>

      </div>

      <div
        id="LibraryManagerBody"
        className={`flex-grow flex flex-col w-full justify-start items-center overflow-y-scroll ${
          deviceType === "mobile" ? "no-scrollbar" : "pl-[0.75rem]"
        }`}
      >
        <div
          id="LibraryListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        >
          {sortedLibraryIds.length > 0 &&
            sortedLibraryIds.map(
              ([libraryId, ], index) =>
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
