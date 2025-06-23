const TiptapUtilityToolbar = ({
  editor,
  toolbarPreferences,
  keepTOCPanelAwake,
  keepStatsPanelAwake,
  keepSearchReplacePanelAwake,
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
    backgroundColor,
    buttonColor,
    dividerColor,
    fontSize,
    textFormatButtonWidth,
    toolbarFontSize,
    hoverColor,
    pressedColor,
  } = toolbarPreferences;
  return (
    <div className="w-fit h-full flex items-center z-[2]">
      <style>
        {`
            .toolbarButton {
              background-color: ${backgroundColor};
            }

            .toolbarButton:hover {
              background-color: ${hoverColor};
            }
          `}
      </style>
      <button
        className="toolbarButton shrink-0"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
        }}
        onClick={() => editor.commands.undo()}
      >
        <span className="icon-[material-symbols-light--undo] w-full h-full text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
        }}
        onClick={() => editor.commands.redo()}
      >
        <span className="icon-[material-symbols-light--redo] w-full h-full text-appLayoutText"></span>
      </button>
      <div
        className="w-px h-[70%]"
        style={{ backgroundColor: `${dividerColor}` }}
      ></div>
      <button
        className="toolbarButton"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
        }}
        onClick={() => {
          keepTOCPanelAwake();
        }}
      >
        <span className="icon-[carbon--table-of-contents] w-[95%] h-[95%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton flex items-center justify-center"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
        }}
        onClick={() => {
          keepStatsPanelAwake();
        }}
      >
        <span className="icon-[nimbus--stats] w-[75%] h-[75%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton flex items-center justify-center"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
        }}
        onClick={() => {
          keepSearchReplacePanelAwake();
        }}
      >
        <span className="icon-[lsicon--find-filled] w-[75%] h-[75%] text-appLayoutText"></span>
      </button>
    </div>
  );
};

export default TiptapUtilityToolbar;
