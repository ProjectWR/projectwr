import { appStore } from "../../app/stores/appStore";

export const StatisticsPanel = ({ editor, toolbarPreferences }) => {

  const statsPinned = appStore((state) => state.statsPinned);
  const setStatsPinned = appStore((state) => state.setStatsPinned);

  const { buttonHeight, buttonWidth, buttonRadius } = toolbarPreferences;

  return (
    <div className="w-fit h-fit flex absolute bottom-1 left-1 items-end">
      <div className="h-fit w-fit flex z-[100]">
        {/* Trigger Button */}
        <button
          className={`rounded-lg transition-all duration-200 ${statsPinned ? "opacity-100" : "opacity-30 hover:opacity-60"
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
            <span>{editor.storage.characterCount.words()}</span>
            <span className="ml-2">Characters</span>
            <span>{editor.storage.characterCount.characters()}</span>
          </div>


        )}
      </div>
    </div>
  );
};
