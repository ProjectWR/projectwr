import React from "react";
import PropTypes from "prop-types";
import WritingAppButton from "../../../../../design-system/WritingAppButton";
import { pageStore } from "../../../../stores/pageStore";
import useYMap from "../../../../hooks/useYMap";

const DirectoryPaperNode = ({ paperEntryReference, className }) => {
  console.log("paper node rendering");
  const setContentPanel = pageStore((state) => state.setContentPanel);
  const setActiveLibraryItemEntryReference = pageStore(
    (state) => state.setActiveLibraryItemEntryReference
  );

  const paperEntryState = useYMap(paperEntryReference);

  const onPaperNodeClick = () => {
    setContentPanel("createPaper");
    setActiveLibraryItemEntryReference(paperEntryReference);
  };

  return (
    <div className={`w-full h-[2rem]`}>
      <WritingAppButton
        className={`w-full h-[2rem] pl-[0.75rem] justify-start hover:bg-shadow-partial ${className}`}
        buttonContent={
          <div>
            <p>{paperEntryState.title} </p>
          </div>
        }
        onClick={onPaperNodeClick}
      />
    </div>
  );
};

DirectoryPaperNode.propTypes = {
  paperEntryReference: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default React.memo(DirectoryPaperNode);
