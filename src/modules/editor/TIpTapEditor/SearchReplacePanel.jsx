export const SearchReplacePanel = ({
  editor,
  visible = false,
  refreshSearchReplacePanel,
  keepSearchReplacePanelAwake,
  forceCloseSearchReplacePanel,
}) => {
  return (
    <div
      id="SearchReplacePanel"
      onMouseEnter={() => {
        keepSearchReplacePanelAwake();
      }}
      onMouseLeave={() => {
        refreshSearchReplacePanel();
      }}
      style={{
        transform: visible
          ? `translateX(0) translateY(105%)`
          : `translateX(0) translateY(0%)`,
      }}
      className={`rounded-sm shadow-sm
                shadow-appLayoutGentleShadow h-full
                w-[40%]
                border border-appLayoutBorder 
                text-appLayoutText bg-appBackground translate-transform
                duration-200 flex flex-col items-start justify-start px-3 py-1`}
    >
      <div className="grow w-full basis-0 min-h-0 flex flex-col items-start font-sans">
        
      </div>
    </div>
  );
};
