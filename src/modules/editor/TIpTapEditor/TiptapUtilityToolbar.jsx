import { yXmlFragmentToDocx } from "../../app/lib/importExport";
import PropTypes from "prop-types";

const TiptapUtilityToolbar = ({
  editor,
  toolbarPreferences,
  keepTOCPanelAwake,
  isTOCPanelAwake,
  forceCloseTOCPanel,
  refreshTOCPanel,
  keepStatsPanelAwake,
  isStatsPanelAwake,
  refreshStatsPanel,
  forceCloseStatsPanel,
  keepSearchReplacePanelAwake,
  isSearchReplacePanelAwake,
  forceCloseSearchReplacePanel,
  refreshSearchReplacePanel,
  yXmlFragment,
}) => {
  const {
    toolbarHeight,
    toolbarButtonHeight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    buttonHeight,
    buttonWidth,
    buttonRadius,
    buttonColor,
    dividerColor,
    fontSize,
    textFormatButtonWidth,
    toolbarFontSize,
    hoverColor,
    pressedColor,
    buttonBackgroundOpacity = 100,
    iconColor,
    buttonBackgroundBlur = 0,
    hoverColorOpacity = 100,
  } = toolbarPreferences;
  return (
    <div className="w-fit h-full flex items-center z-[2]">
      <style>
        {`
            .toolbarButton {
              background-color: color-mix(in srgb, ${buttonColor}, transparent ${100 - buttonBackgroundOpacity}%);
              ${buttonBackgroundBlur > 0 ? `backdrop-filter: blur(${buttonBackgroundBlur}px);` : ""}
              color: ${iconColor};
            }

            .toolbarButton:hover {
              background-color: color-mix(in srgb, ${hoverColor}, transparent ${100 - hoverColorOpacity}%);
            }
          `}
      </style>
      <button
        className="toolbarButton shrink-0"
        style={{
          height: `calc(${buttonHeight}px * var(--uiScale))`,
          borderRadius: `${buttonRadius}px`,
          width: `calc(${buttonWidth}px * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}px * var(--uiScale))`,
        }}
        onClick={() => editor.commands.undo()}
      >
        <span className="icon-[material-symbols-light--undo] w-full h-full"></span>
      </button>
      <button
        className="toolbarButton"
        style={{
          height: `calc(${buttonHeight}px * var(--uiScale))`,
          borderRadius: `${buttonRadius}px`,
          width: `calc(${buttonWidth}px * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}px * var(--uiScale))`,
        }}
        onClick={() => editor.commands.redo()}
      >
        <span className="icon-[material-symbols-light--redo] w-full h-full"></span>
      </button>
      <div
        className="w-px h-[70%]"
        style={{ backgroundColor: `${dividerColor}` }}
      ></div>
      <button
        className="toolbarButton flex items-center justify-center"
        style={{
          height: `calc(${buttonHeight}px * var(--uiScale))`,
          borderRadius: `${buttonRadius}px`,
          width: `calc(${buttonWidth}px * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}px * var(--uiScale))`,
        }}
        onClick={() => {
          if (isSearchReplacePanelAwake) {
            forceCloseSearchReplacePanel();
          } else {
            keepSearchReplacePanelAwake();
            refreshSearchReplacePanel();
          }
        }}
      >
        <span className="icon-[lsicon--find-filled] w-[75%] h-[75%]"></span>
      </button>
    </div>
  );
};

TiptapUtilityToolbar.propTypes = {
  editor: PropTypes.object,
  yXmlFragment: PropTypes.object,
  toolbarPreferences: PropTypes.shape({
    buttonColor: PropTypes.string,
    borderColor: PropTypes.string,
    iconColor: PropTypes.string,
    hoverColor: PropTypes.string,
    pressedColor: PropTypes.string,
    buttonBackgroundOpacity: PropTypes.number,
    buttonBackgroundBlur: PropTypes.number,
    hoverColorOpacity: PropTypes.number,
    toolbarShadow: PropTypes.number,
    toolbarShadowColor: PropTypes.string,
  }),
  keepTOCPanelAwake: PropTypes.func,
  isTOCPanelAwake: PropTypes.bool,
  forceCloseTOCPanel: PropTypes.func,
  refreshTOCPanel: PropTypes.func,
  keepStatsPanelAwake: PropTypes.func,
  isStatsPanelAwake: PropTypes.bool,
  forceCloseStatsPanel: PropTypes.func,
  refreshStatsPanel: PropTypes.func,
  keepSearchReplacePanelAwake: PropTypes.func,
  isSearchReplacePanelAwake: PropTypes.bool,
  forceCloseSearchReplacePanel: PropTypes.func,
  refreshSearchReplacePanel: PropTypes.func,
};

export default TiptapUtilityToolbar;
