import { useCallback, useEffect, useState } from "react";

export const SearchReplacePanel = ({
  editor,
  visible = true,
  toolbarPreferences,
  refreshSearchReplacePanel,
  keepSearchReplacePanelAwake,
  forceCloseSearchReplacePanel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");

  const onSearchInputChange = useCallback((e) => {
    const { value } = e.target;
    setSearchTerm(value);
  }, []);

  const onReplaceInputChange = useCallback((e) => {
    const { value } = e.target;
    setReplaceTerm(value);
  }, []);

  useEffect(() => {
    editor.commands.setSearchTerm(searchTerm);
  }, [searchTerm, editor]);

  useEffect(() => {
    editor.commands.setReplaceTerm(replaceTerm);
  }, [replaceTerm, editor]);

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
                shadow-appLayoutGentleShadow h-fit text-[1rem]
                w-[30%]
                border border-appLayoutBorder 
                text-appLayoutText bg-appBackground translate-transform
                duration-200 flex gap-1 flex-col items-start justify-start p-1`}
    >
      <div className="w-full h-[1.75rem] flex gap-1">
        <input
          name="searchTermInput"
          placeholder="search"
          value={searchTerm}
          className="w-[60%] rounded-sm h-full focus:bg-appLayoutInputBackground p-2 focus:outline-none border border-appLayoutBorder"
          onChange={onSearchInputChange}
        />
        <div className="h-full grow basis-0 min-w-0 flex gap-1">
          <button className="h-full grow basis-0 flex items-center justify-center hover:bg-appLayoutInverseHover active:bg-appLayoutInverseHover border border-appLayoutBorder rounded-sm">
            <span>P</span>
          </button>
          <button className="h-full grow basis-0 flex items-center justify-center hover:bg-appLayoutInverseHover active:bg-appLayoutInverseHover border border-appLayoutBorder rounded-sm">
            <span>N</span>
          </button>
        </div>
      </div>

      <div className="w-full h-[1.75rem] flex gap-1">
        <input
          name="replaceTermInput"
          placeholder="replace"
          value={replaceTerm}
          className="w-[60%] rounded-sm h-full focus:bg-appLayoutInputBackground p-2 focus:outline-none border border-appLayoutBorder"
          onChange={onReplaceInputChange}
        />
        <div className="h-full grow basis-0 min-w-0 flex gap-1">
          <button className="h-full grow basis-0 flex items-center justify-center hover:bg-appLayoutInverseHover active:bg-appLayoutInverseHover border border-appLayoutBorder rounded-sm">
            <span>P</span>
          </button>
          <button className="h-full grow basis-0 flex items-center justify-center hover:bg-appLayoutInverseHover active:bg-appLayoutInverseHover border border-appLayoutBorder rounded-sm">
            <span>N</span>
          </button>
        </div>
      </div>
    </div>
  );
};
