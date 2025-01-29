import { useRef } from "react";
import dataManager from "../../../../lib/data";
import { sortArrayByOrder } from "../../../../utils/orderUtil";
import { pageStore } from "../../../../stores/pageStore";
import WritingAppButton from "../../../../../design-system/WritingAppButton";
import LibraryManagerNode from "./LibraryManagerNode";
import useLibrariesMap from "../../../../hooks/useLibrariesMap";

const LibraryManager = () => {
  const setContentPanel = pageStore((state) => state.setContentPanel);

  const setActiveLibraryItemEntryReference = pageStore(
    (state) => state.setActiveLibraryItemEntryReference
  );

  const librariesMapReference = useRef(dataManager.fetchOrInitLibraries());
  const librariesMapState = useLibrariesMap(librariesMapReference.current);

  console.log(librariesMapState);

  return (
    <div id="LibraryManagerContainer" className={`h-full w-full flex flex-col`}>
      <div
        id="LibraryManagerHeader"
        className={`flex items-center justify-center h-[4rem] min-h-[4rem] border-b border-border shadow-sm shadow-shadow`}
      >
        <h1 className="text-xl text-neutral-300">Your Libraries</h1>
        <WritingAppButton
          className="ml-1 w-[2rem] h-[2rem] p-1 mr-1 text-3xl rounded-[0.3rem] hover:text-white justify-center"
          buttonContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#fbfafa"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m-8-8h16"
                color="#fbfafa"
              ></path>
            </svg>
          }
          onClick={() => {
            setContentPanel("createLibrary");

            setActiveLibraryItemEntryReference(
              dataManager.createEmptyLibrary({
                library_name: "Library Name",
                library_description: "Library Description",
              })
            );
          }}
        />
      </div>

      <div
        id="LibraryManagerBody"
        className="flex-grow flex flex-col w-full justify-start items-center pl-[0.75rem] overflow-y-scroll"
      >
        <div
          id="LibraryListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        >
          {Object.keys(librariesMapState).length > 0 &&
            sortArrayByOrder(Object.entries(librariesMapState)).map(
              ([key, libraryEntry], index) =>
                libraryEntry && (
                  <div
                    key={key}
                    id={`LibraryListNode-${index}`}
                    className="w-full h-[6rem] min-h-[6rem] border-b border-border "
                  >
                    <LibraryManagerNode
                      libraryEntryReference={dataManager.fetchLibraryEntry(key)}
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
