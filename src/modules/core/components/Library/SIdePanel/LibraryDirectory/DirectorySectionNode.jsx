import React, { useState } from "react";
import PropTypes from "prop-types";
import dataManager from "../../../../lib/data";
import LibraryManagerButton from "../../../../../design-system/LibraryManagerButton";
import { sortArrayByOrder } from "../../../../utils/orderUtil";
import DirectoryItemNode from "./DirectoryItemNode";
import useYMap from "../../../../hooks/useYMap";
import useItemEntriesMap from "../../../../hooks/useItemEntriesMap";
import WritingAppButton from "../../../../../design-system/WritingAppButton";
import { pageStore } from "../../../../stores/pageStore";
import persistenceManagerForSubdocs from "@/modules/core/lib/persistenceSubDocs";

const DirectorySectionNode = ({ sectionEntryReference, className }) => {
  console.log("section node rendering");

  const setContentPanel = pageStore((state) => state.setContentPanel);
  const setActiveLibraryItemEntryReference = pageStore(
    (state) => state.setActiveLibraryItemEntryReference
  );

  const sectionEntryState = useYMap(sectionEntryReference);

  const itemEntriesMapReference = dataManager.fetchItemsMap(
    sectionEntryReference
  );
  const itemEntriesMapState = useItemEntriesMap(itemEntriesMapReference);

  const [isOpened, setIsOpened] = useState(false);

  const onSectionNodeClick = () => {
    if (isOpened) {
      setIsOpened(false);
    } else {
      setIsOpened(true);
      setContentPanel("createSection");
      setActiveLibraryItemEntryReference(sectionEntryReference);
    }
  };

  const onEditClick = () => {
    setContentPanel("createSection");
    setActiveLibraryItemEntryReference(sectionEntryReference);
  };

  const onCreatePaperClick = () => {
    setIsOpened(true);
    setContentPanel("createPaper");

    const newPaper = dataManager.createYDocPaperItem(sectionEntryReference, {
      title: "Page",
    });
    

    newPaper.get("paper-ydoc").load();
    persistenceManagerForSubdocs.initLocalPersistenceForYDoc(
      newPaper.get("paper-ydoc")
    );

    setActiveLibraryItemEntryReference(newPaper);
  };

  const onCreateSectionClick = () => {
    setIsOpened(true);
    setContentPanel("createSection");

    setActiveLibraryItemEntryReference(
      dataManager.createSectionItem(sectionEntryReference, {
        title: "Chapters",
        prefix: "Chapter",
      })
    );
  };

  return (
    <div
      className={`section-node h-auto w-full overflow-x-hidden overflow-y-auto ${className}`}
    >
      <div className="flex h-auto w-full items-center justify-between hover:bg-hover">
        <WritingAppButton
          className={`w-[50%] h-[2rem] flex-grow flex justify-between items-center hover:bg-shadow-partial  ${
            isOpened ? "text-text" : "text-text-ambient"
          }`}
          onClick={() => onSectionNodeClick()}
          buttonContent={
            <div className={`flex justify-start items-center`}>
              <p className="px-1">
                {isOpened ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#fbfafa"
                      d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#fbfafa"
                      d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z"
                    ></path>
                  </svg>
                )}
              </p>
              <p>{sectionEntryState.title}</p>
            </div>
          }
        />

        <WritingAppButton
          className={`w-[2rem] h-full p-1 flex justify-center items-center hover:bg-shadow-partial text-text-muted hover:text-text`}
          buttonContent={
            <span
              className="icon-[mdi--edit-outline] "
              style={{ width: "20px", height: "20px" }}
            ></span>
          }
          onClick={() => onEditClick()}
        />

        <WritingAppButton
          className={`w-fit h-full p-1 flex justify-center items-center hover:bg-shadow-partial text-text-muted hover:text-text`}
          buttonContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={22}
              height={22}
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
          onClick={() => onCreatePaperClick()}
        />

        <WritingAppButton
          className={`w-[2rem] h-full flex justify-center items-center hover:bg-shadow-partial text-text-muted hover:text-text`}
          buttonContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={22}
              height={22}
              viewBox="0 0 24 24"
            >
              <path
                fill="#fbfafa"
                d="M13 19c0 .34.04.67.09 1H4a2 2 0 0 1-2-2V6c0-1.11.89-2 2-2h6l2 2h8a2 2 0 0 1 2 2v5.81c-.61-.35-1.28-.59-2-.72V8H4v10h9.09c-.05.33-.09.66-.09 1m7-1v-3h-2v3h-3v2h3v3h2v-3h3v-2z"
              ></path>
            </svg>
          }
          onClick={() => onCreateSectionClick()}
        />
      </div>

      {isOpened && (
        <div className="div-for-line pl-[0.93rem]">
          <div
            className={`section-node-content pl-[0.28rem] h-fit w-full grid grid-cols-1  border-l  border-accent`}
          >
            {Object.keys(itemEntriesMapState).length > 0 &&
              sortArrayByOrder(Object.entries(itemEntriesMapState)).map(
                ([key, itemEntry]) =>
                  itemEntry && (
                    <div id={`ItemListNode-${key}`} key={key}>
                      <DirectoryItemNode
                        itemEntryReference={dataManager.fetchItem(
                          sectionEntryReference,
                          key
                        )}
                        className={``}
                      />
                    </div>
                  )
              )}
          </div>
        </div>
      )}
    </div>
  );
};

DirectorySectionNode.propTypes = {
  sectionEntryReference: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default React.memo(DirectorySectionNode, (prev, next) => {
  return (
    prev.sectionEntryReference.get("section_id") ===
    next.sectionEntryReference.get("section_id")
  );
});
