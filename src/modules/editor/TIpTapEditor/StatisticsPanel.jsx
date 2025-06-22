export const StatisticsPanel = ({ editor, visible = true }) => {
  return (
    <div
      id="StatisticsPanel"
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
      <div className="grow w-full basis-0 min-h-0 flex flex-col items-start">
        <div className="h-[3rem] w-full">
          <span className="text-lg text-appLayoutTextMuted grow">
            Word Count
          </span>
          <span className="text-lg text-appLayoutText grow">
            {editor.storage.characterCount.words()}
          </span>
        </div>
        <div className="h-[3rem] w-full">
          <span className="text-lg text-appLayoutTextMuted grow">
            Character Count
          </span>
          <span className="text-lg text-appLayoutText grow">
            {editor.storage.characterCount.character()}
          </span>
        </div>
      </div>
    </div>
  );
};
