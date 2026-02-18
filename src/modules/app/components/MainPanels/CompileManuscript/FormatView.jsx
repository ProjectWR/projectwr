import PropTypes from "prop-types";
import FormatEditor from "./FormatEditor";
import FormatPreview from "./FormatPreview";

const FormatView = ({ manuscriptData, libraryId }) => {
  return (
    <div
      id="FormatViewContainer"
      className="grow min-h-0 overflow-hidden w-full basis-0 flex gap-2 border border-appLayoutBorder rounded-lg p-2"
    >
      <div id="FormatEditorContainer" className="w-1/3 h-full max-h-full">
        <FormatEditor manuscriptData={manuscriptData} libraryId={libraryId} />
      </div>

      <div className="h-full w-px bg-appLayoutBorder"></div>

      <div
        id="FormatViewPreviewContainer"
        className="h-full grow min-w-0 basis-0 bg-neutral-800 rounded-lg overflow-hidden"
      >
        <FormatPreview manuscriptData={manuscriptData} libraryId={libraryId} />
      </div>
    </div>
  );
};

FormatView.propTypes = {
  manuscriptData: PropTypes.array,
  libraryId: PropTypes.string,
};

export default FormatView;
