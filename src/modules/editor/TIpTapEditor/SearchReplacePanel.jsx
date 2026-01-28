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
  
  const {
    backgroundColor,
    backgroundColorOpacity,
    toolbarBlur,
    borderColor,
    iconColor,
    hoverColor,
    pressedColor,
  } = toolbarPreferences;

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

  useEffect(() => {
    if (searchTerm.length > 0 || replaceTerm.length > 0) {
      keepSearchReplacePanelAwake();
    } else {
      refreshSearchReplacePanel();
    }
  }, [searchTerm, replaceTerm]);

  const goToSelection = useCallback(() => {
    if (!editor) return;

    const { results, resultIndex } = editor.storage.searchAndReplace;
    const position = results[resultIndex];

    if (!position) return;

    editor.commands.setTextSelection(position);

    const { node } = editor.view.domAtPos(editor.state.selection.anchor);
    node instanceof HTMLElement &&
      node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editor]);

  const replace = () => {
    editor.commands.replace();
    goToSelection();
  };

  const next = () => {
    editor.commands.nextSearchResult();
    goToSelection();
  };

  const previous = () => {
    editor.commands.previousSearchResult();
    goToSelection();
  };

  const clear = () => {
    setSearchTerm("");
    setReplaceTerm("");
    editor.commands.resetIndex();
  };

  const replaceAll = () => editor.commands.replaceAll();

  return (
    <div
      id="SearchReplacePanel"
      onMouseEnter={() => {
        keepSearchReplacePanelAwake();
      }}
      onMouseLeave={() => {
        if (searchTerm.length > 0 || replaceTerm.length > 0) {
          keepSearchReplacePanelAwake();
        } else {
          refreshSearchReplacePanel();
        }
      }}
      style={{
        transform: visible
          ? `translateX(0) translateY(105%)`
          : `translateX(0) translateY(-5%)`,
        backgroundColor: `color-mix(in srgb, ${backgroundColor} ${backgroundColorOpacity ?? 100}%, transparent)`,
        backdropFilter: `blur(${toolbarBlur || 0}px)`,
        borderColor: borderColor,
        color: iconColor,
      }}
      className={`rounded-sm shadow-sm mt-auto
                shadow-appLayoutGentleShadow h-fit text-[1rem]
                w-[35%]
                border 
                duration-200 flex gap-1 flex-col items-start justify-start p-1`}
    >
      <div className="w-full h-[1.75rem] flex gap-1">
        <input
          name="searchTermInput"
          placeholder="search"
          value={searchTerm}
          className="w-[80%] rounded-sm h-full p-2 focus:outline-none border border-appLayoutBorder"
          style={{
            backgroundColor: "transparent",
            borderColor: borderColor,
            color: iconColor,
          }}
          onChange={onSearchInputChange}
        />
        <div className="h-full grow basis-0 min-w-0 flex gap-1">
          <button
            onClick={previous}
            className="h-full grow basis-0 flex items-center justify-center rounded-sm transition-colors"
            style={{
              border: `1px solid ${borderColor}`,
              "--hover-bg": hoverColor,
              "--active-bg": pressedColor,
            }}
          >
            <span
              className="icon-[formkit--left] h-[80%] w-[80%]"
              style={{ backgroundColor: iconColor }}
            ></span>
          </button>
          <button
            onClick={next}
            className="h-full grow basis-0 flex items-center justify-center rounded-sm transition-colors"
            style={{
              border: `1px solid ${borderColor}`,
              "--hover-bg": hoverColor,
              "--active-bg": pressedColor,
            }}
          >
            <span
              className="icon-[formkit--right] h-[80%] w-[80%]"
              style={{ backgroundColor: iconColor }}
            ></span>
          </button>
        </div>
      </div>

      <div className="w-full h-[1.75rem] flex gap-1">
        <input
          name="replaceTermInput"
          placeholder="replace"
          value={replaceTerm}
          className="w-[80%] rounded-sm h-full p-2 focus:outline-none border border-appLayoutBorder"
          style={{
            backgroundColor: "transparent",
            borderColor: borderColor,
            color: iconColor,
          }}
          onChange={onReplaceInputChange}
        />
        <div className="h-full grow basis-0 min-w-0 flex gap-1">
          <button
            onClick={replace}
            className="h-full grow basis-0 flex items-center justify-center rounded-sm transition-colors"
            style={{
              border: `1px solid ${borderColor}`,
              "--hover-bg": hoverColor,
              "--active-bg": pressedColor,
            }}
          >
            <span
              className="icon-[codicon--replace] h-[80%] w-[80%]"
              style={{ backgroundColor: iconColor }}
            ></span>
          </button>
          <button
            onClick={replaceAll}
            className="h-full grow basis-0 flex items-center justify-center rounded-sm transition-colors"
            style={{
              border: `1px solid ${borderColor}`,
              "--hover-bg": hoverColor,
              "--active-bg": pressedColor,
            }}
          >
            <span
              className="icon-[codicon--replace-all] h-[80%] w-[80%]"
              style={{ backgroundColor: iconColor }}
            ></span>
          </button>
        </div>
      </div>
      <style>{`
        #SearchReplacePanel button:hover {
          background-color: var(--hover-bg) !important;
        }
        #SearchReplacePanel button:active {
          background-color: var(--active-bg) !important;
        }
      `}</style>
    </div>
  );
};
