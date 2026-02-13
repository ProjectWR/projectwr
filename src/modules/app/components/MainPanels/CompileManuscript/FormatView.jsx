import { useState } from "react";
import PropTypes from "prop-types";

const FormatView = ({ manuscriptData, compileConfig }) => {
  return (
    <div className="flex w-full grow border border-appLayoutBorder rounded overflow-hidden">
      <div
        id="FormatEditorPanel"
        className="w-sidePanelWidth h-full border-r border-appLayoutBorder"
      ></div>
      <div id="FormatPreview" className="grow h-full"></div>
    </div>
  );
};

FormatView.propTypes = {
  manuscriptData: PropTypes.array.isRequired,
  compileConfig: PropTypes.array.isRequired,
};

export default FormatView;
