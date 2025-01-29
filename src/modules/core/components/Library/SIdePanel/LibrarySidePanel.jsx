import { Fragment } from "react";
import DynamicSizeElement from "../../../../design-system/dynamicSizeElement";
import { pageStore } from "../../../stores/pageStore";
import useYMap from "../../../hooks/useYMap";
import WritingAppButton from "../../../../design-system/WritingAppButton";
import dataManager from "../../../lib/data";
import LibraryDirectory from "./LibraryDirectory/LibraryDirectory";

const LibrarySidePanel = () => { 
  const libraryEntryReference = pageStore(
    (state) => state.activeLibraryEntryReference
  );

  console.log(libraryEntryReference);

  const setActiveLibraryItemEntryReference = pageStore(
    (state) => state.setActiveLibraryItemEntryReference
  );
  const setContentPanel = pageStore((state) => state.setContentPanel);

  const libraryEntryState = useYMap(libraryEntryReference);

  return (
    <Fragment>
      <div
        id="libraryPanelHeader"
        className="w-full h-[9rem] min-h-[9rem] border-b border-border flex flex-col items-center justify-center "
      >
        <div
          id="libraryPanelHeaderTitle"
          className="text-lg flex-grow p-5 border-b border-border w-full flex items-center justify-center shadow-inner "
        >
          <h1>
            <DynamicSizeElement
              steps={[
                [0, "4xl"],
                [10, "3xl"],
                [20, "lg"],
                [80, "lg"]
              ]}
              buttonContent={libraryEntryState.library_name}
            />
          </h1>
        </div>
        <div
          id="libraryPanelHeaderControls"
          className="h-[2.5rem] w-full flex items-center py-1 px-6"
        >
          <WritingAppButton
            className="w-[2rem] h-full p-1 mr-1 text-3xl rounded-[0.3rem] justify-center hover:bg-accent-foreground"
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
              setContentPanel("createBook");

              setActiveLibraryItemEntryReference(
                dataManager.createBookItem(libraryEntryReference, {
                  title: "Book Title",
                  description: "Book Description",
                })
              );
            }}
          />

          <input
            className="flex-grow h-full bg-input-background rounded-sm px-2 focus:outline-none"
            placeholder="Filter..."
          />
        </div>
      </div>

      <div id="libraryPanelBodyContainer" className="flex-grow w-full min-h-0 shadow-inner shadow-shadow">
        <div id="libraryPanelBody" className="w-full h-full max-h-full">
          <LibraryDirectory libraryEntryReference={libraryEntryReference} />
        </div>
      </div>
    </Fragment>
  );
};

export default LibrarySidePanel;
