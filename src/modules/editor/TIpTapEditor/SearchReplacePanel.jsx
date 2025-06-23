export const SearchReplacePanel = ({
  editor,
  visible = true,
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
        transform: true
          ? `translateX(0) translateY(105%)`
          : `translateX(0) translateY(0%)`,
      }}
      className={`rounded-sm shadow-sm mt-auto
                shadow-appLayoutGentleShadow h-fit
                w-[40%]
                border border-appLayoutBorder 
                text-appLayoutText bg-appBackground translate-transform
                duration-200 flex flex-col items-start justify-start px-3 py-1`}
    >
      <div className="w-full h-[2rem] flex">
        <input
          name="searchTermInput"
          placeholder="search"
          className="w-[60%] h-full"
        />
        <div className="h-full grow basis-0 min-w-0 flex">
          <button className="h-full grow basis-0">Previous</button>
          <button className="h-full grow basis-0">Next</button>
        </div>
      </div>
    </div>
  );
};
