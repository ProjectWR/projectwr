import { appStore } from "../../app/stores/appStore";

export const StatisticsPanel = ({ mode, editor, toolbarPreferences }) => {
  const statsPinned = appStore((state) => state.statsPinned);
  const setStatsPinned = appStore((state) => state.setStatsPinned);

  const {
    backgroundColor,
    backgroundColorOpacity,
    toolbarBlur,
    buttonColor,
    iconColor,
    dividerColor,
    fontSize,
    textFormatButtonWidth,
    toolbarFontSize,
    hoverColor,
    pressedColor,
    borderColor,
    buttonHeight,
    buttonRadius,
    buttonWidth
  } = toolbarPreferences;

  return (
    <div
      style={{
        backgroundColor: statsPinned
          ? `color-mix(in srgb, ${backgroundColor} ${backgroundColorOpacity ?? 100}%, transparent)`
          : "transparent",
        backdropFilter: statsPinned ? `blur(${toolbarBlur || 0}px)` : "none",
        borderColor: statsPinned ? borderColor : "transparent",
      }}
      className="w-fit h-fit pl-1 pr-3 py-1 flex absolute bottom-0 left-0 z-[90] items-end border-t border-r rounded-tr-lg "
    >
      <div className="h-fit w-fit flex z-[100] ">
        {/* Trigger Button */}
        <button
          tabIndex={-1}
          className={`rounded-lg transition-all duration-200 ${
            statsPinned ? "opacity-100" : "opacity-50 hover:opacity-75"
          }`}
          style={{
            height: `calc(${buttonHeight}px * var(--uiScale) * 0.75)`,
            borderRadius: `${buttonRadius}px`,
            width: `calc(${buttonWidth}px * var(--uiScale) * 0.75)`,
            minWidth: `calc(${buttonWidth}px * var(--uiScale) * 0.75)`,
          }}
          onClick={() => setStatsPinned(!statsPinned)}
        >
          <span
            className="icon-[nimbus--stats] w-full h-full"
            style={{ backgroundColor: iconColor }}
          />
        </button>
      </div>

      <div
        className={`w-fit min-w-0 z-[90] pointer-events-none 
                    transition-opacity duration-300 opacity-100`}
      >
        {/* Statistics content */}
        {statsPinned && (
          <div
            style={{
              color: iconColor,
            }}
            className="text-libraryDirectoryBookNodeFontSize flex gap-3 items-end pl-2 pb-1 leading-none"
          >
            <span>Words:</span>
            <span>
              {mode == "editPaper" ? editor.storage.characterCount.words() : ""}{" "}
              {mode == "previewTemplate" ? "8987998" : ""}
            </span>
            <span className="ml-1">Characters:</span>
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
