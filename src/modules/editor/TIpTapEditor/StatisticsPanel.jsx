export const StatisticsPanel = ({
  editor,
  visible = false,
  refreshStatsPanel,
  keepStatsPanelAwake,
}) => {
  return (
    <div
      id="StatisticsPanel"
      onMouseEnter={() => {
        keepStatsPanelAwake();
      }}
      onMouseLeave={() => {
        refreshStatsPanel();
      }}
      style={{
        transform: visible
          ? `translateX(-105%) translateY(0%)`
          : `translateX(0) translateY(0%)`,
      }}
      className={`rounded-lg shadow-sm
                shadow-appLayoutGentleShadow w-full
                h-[20%]
                border border-appLayoutBorder 
                text-appLayoutText bg-appBackground translate-transform
                duration-200 flex flex-col items-start justify-start px-3 py-1`}
    >
      <span className="text-xl text-appLayoutText py-2 border-b border-appLayoutBorder w-full">
        Statistics
      </span>
      <div className="grow w-full basis-0 min-h-0 flex flex-col items-start font-sans">
        <div className="h-[2rem] w-full flex items-center">
          <span className="text-sm text-appLayoutTextMuted grow basis-0 flex items-center justify-start">
            Word count
          </span>
          <span className="text-sm text-appLayoutText grow basis-0 flex items-center justify-start">
            {editor.storage.characterCount.words()}
          </span>
        </div>
        <div className="h-[2rem] w-full flex items-center">
          <span className="text-sm text-appLayoutTextMuted grow basis-0 flex items-center justify-start">
            Character count
          </span>
          <span className="text-sm text-appLayoutText grow basis-0 flex items-center justify-start">
            {editor.storage.characterCount.characters()}
          </span>
        </div>
      </div>
    </div>
  );
};
