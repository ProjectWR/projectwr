import { appStore } from "../../app/stores/appStore";

export const StatisticsPanel = ({ mode, editor, toolbarPreferences }) => {
  const statsPinned = appStore((state) => state.statsPinned);
  const setStatsPinned = appStore((state) => state.setStatsPinned);

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
    borderColor,
  } = toolbarPreferences;

  return (
    <div
      className="w-fit h-fit flex absolute bottom-1 left-1 items-end"
    >
      <div className="h-fit w-fit flex z-[100]">
        {/* Trigger Button */}
        <button
          className={`rounded-lg transition-all duration-200 ${
            statsPinned ? "opacity-100" : "opacity-30 hover:opacity-60"
          }`}
          style={{
            height: `calc(${buttonHeight}px * var(--uiScale) * 0.75)`,
            borderRadius: `${buttonRadius}px`,
            width: `calc(${buttonWidth}px * var(--uiScale) * 0.75)`,
            minWidth: `calc(${buttonWidth}px * var(--uiScale) * 0.75)`,
          }}
          onClick={() => setStatsPinned(!statsPinned)}
        >
          <span className="icon-[nimbus--stats] w-full h-full text-appLayoutText" />
        </button>
      </div>

      <div
        className={`grow w-[200px] z-[90] pointer-events-none
                    transition-opacity duration-300 opacity-100`}
      >
        {/* Statistics content */}
        {statsPinned && (
          <div className="text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted flex gap-3 items-end pl-2 pb-1 leading-none">
            <span>Words</span>
            <span>
              {mode == "editPaper" ? editor.storage.characterCount.words() : ""}{" "}
              {mode == "previewTemplate" ? "8987998" : ""}
            </span>
            <span className="ml-2">Characters</span>
            <span>
              {mode == "editPaper"
                ? editor.storage.characterCount.characters()
                : ""}{" "}
              {mode == "previewTemplate" ? "81987998" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
