// MIT License

// Copyright (c) 2023 - 2024 Jeet Mandaliya (Github Username: sereneinserenade)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Extension, Range } from "@tiptap/core";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  Plugin,
  PluginKey,
} from "@tiptap/pm/state";
import { Node as PMNode } from "@tiptap/pm/model";

const getRegex = (
  s,
  disableRegex,
  caseSensitive,
) => {
  return RegExp(
    disableRegex ? s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : s,
    caseSensitive ? "gu" : "gui",
  );
};

function processSearches(
  doc,
  searchTerm,
  searchResultClass,
  resultIndex,
) {
  const decorations = [];
  const results = [];

  let textNodesWithPosition = [];
  let index = 0;

  if (!searchTerm) {
    return {
      decorationsToReturn: DecorationSet.empty,
      results: [],
    };
  }

  doc?.descendants((node, pos) => {
    if (node.isText) {
      if (textNodesWithPosition[index]) {
        textNodesWithPosition[index] = {
          text: textNodesWithPosition[index].text + node.text,
          pos: textNodesWithPosition[index].pos,
        };
      } else {
        textNodesWithPosition[index] = {
          text: `${node.text}`,
          pos,
        };
      }
    } else {
      index += 1;
    }
  });

  textNodesWithPosition = textNodesWithPosition.filter(Boolean);

  for (const element of textNodesWithPosition) {
    const { text, pos } = element;
    const matches = Array.from(text.matchAll(searchTerm)).filter(
      ([matchText]) => matchText.trim(),
    );

    for (const m of matches) {
      if (m[0] === "") break;

      if (m.index !== undefined) {
        results.push({
          from: pos + m.index,
          to: pos + m.index + m[0].length,
        });
      }
    }
  }

  for (let i = 0; i < results.length; i += 1) {
    const r = results[i];
    const className =
      i === resultIndex
        ? `${searchResultClass} ${searchResultClass}-current`
        : searchResultClass;
    const decoration = Decoration.inline(r.from, r.to, {
      class: className,
    });

    decorations.push(decoration);
  }

  return {
    decorationsToReturn: DecorationSet.create(doc, decorations),
    results,
  };
}

const replace = (
  replaceTerm,
  results,
  { state, dispatch },
) => {
  const firstResult = results[0];

  if (!firstResult) return;

  const { from, to } = results[0];

  if (dispatch) dispatch(state.tr.insertText(replaceTerm, from, to));
};

const rebaseNextResult = (
  replaceTerm,
  index,
  lastOffset,
  results,
) => {
  const nextIndex = index + 1;

  if (!results[nextIndex]) return null;

  const { from: currentFrom, to: currentTo } = results[index];

  const offset = currentTo - currentFrom - replaceTerm.length + lastOffset;

  const { from, to } = results[nextIndex];

  results[nextIndex] = {
    to: to - offset,
    from: from - offset,
  };

  return [offset, results];
};

const replaceAll = (
  replaceTerm,
  results,
  { tr, dispatch },
) => {
  let offset = 0;

  let resultsCopy = results.slice();

  if (!resultsCopy.length) return;

  for (let i = 0; i < resultsCopy.length; i += 1) {
    const { from, to } = resultsCopy[i];

    tr.insertText(replaceTerm, from, to);

    const rebaseNextResultResponse = rebaseNextResult(
      replaceTerm,
      i,
      offset,
      resultsCopy,
    );

    if (!rebaseNextResultResponse) continue;

    offset = rebaseNextResultResponse[0];
    resultsCopy = rebaseNextResultResponse[1];
  }

  dispatch(tr);
};

export const searchAndReplacePluginKey = new PluginKey(
  "searchAndReplacePlugin",
);

export const SearchAndReplace = Extension.create(
  {
    name: "searchAndReplace",

    addOptions() {
      return {
        searchResultClass: "search-result",
        disableRegex: true,
      };
    },

    addStorage() {
      return {
        searchTerm: "",
        replaceTerm: "",
        results: [],
        lastSearchTerm: "",
        caseSensitive: false,
        lastCaseSensitive: false,
        resultIndex: 0,
        lastResultIndex: 0,
      };
    },

    addCommands() {
      return {
        setSearchTerm:
          (searchTerm) =>
          ({ editor }) => {
            editor.storage.searchAndReplace.searchTerm = searchTerm;

            return false;
          },
        setReplaceTerm:
          (replaceTerm) =>
          ({ editor }) => {
            editor.storage.searchAndReplace.replaceTerm = replaceTerm;

            return false;
          },
        setCaseSensitive:
          (caseSensitive) =>
          ({ editor }) => {
            editor.storage.searchAndReplace.caseSensitive = caseSensitive;

            return false;
          },
        resetIndex:
          () =>
          ({ editor }) => {
            editor.storage.searchAndReplace.resultIndex = 0;

            return false;
          },
        nextSearchResult:
          () =>
          ({ editor }) => {
            const { results, resultIndex } = editor.storage.searchAndReplace;

            const nextIndex = resultIndex + 1;

            if (results[nextIndex]) {
              editor.storage.searchAndReplace.resultIndex = nextIndex;
            } else {
              editor.storage.searchAndReplace.resultIndex = 0;
            }

            return false;
          },
        previousSearchResult:
          () =>
          ({ editor }) => {
            const { results, resultIndex } = editor.storage.searchAndReplace;

            const prevIndex = resultIndex - 1;

            if (results[prevIndex]) {
              editor.storage.searchAndReplace.resultIndex = prevIndex;
            } else {
              editor.storage.searchAndReplace.resultIndex = results.length - 1;
            }

            return false;
          },
        replace:
          () =>
          ({ editor, state, dispatch }) => {
            const { replaceTerm, results } = editor.storage.searchAndReplace;

            replace(replaceTerm, results, { state, dispatch });

            return false;
          },
        replaceAll:
          () =>
          ({ editor, tr, dispatch }) => {
            const { replaceTerm, results } = editor.storage.searchAndReplace;

            replaceAll(replaceTerm, results, { tr, dispatch });

            return false;
          },
      };
    },

    addProseMirrorPlugins() {
      const editor = this.editor;
      const { searchResultClass, disableRegex } = this.options;

      const setLastSearchTerm = (t) =>
        (editor.storage.searchAndReplace.lastSearchTerm = t);
      const setLastCaseSensitive = (t) =>
        (editor.storage.searchAndReplace.lastCaseSensitive = t);
      const setLastResultIndex = (t) =>
        (editor.storage.searchAndReplace.lastResultIndex = t);

      return [
        new Plugin({
          key: searchAndReplacePluginKey,
          state: {
            init: () => DecorationSet.empty,
            apply({ doc, docChanged }, oldState) {
              const {
                searchTerm,
                lastSearchTerm,
                caseSensitive,
                lastCaseSensitive,
                resultIndex,
                lastResultIndex,
              } = editor.storage.searchAndReplace;

              if (
                !docChanged &&
                lastSearchTerm === searchTerm &&
                lastCaseSensitive === caseSensitive &&
                lastResultIndex === resultIndex
              )
                return oldState;

              setLastSearchTerm(searchTerm);
              setLastCaseSensitive(caseSensitive);
              setLastResultIndex(resultIndex);

              if (!searchTerm) {
                editor.storage.searchAndReplace.results = [];
                return DecorationSet.empty;
              }

              const { decorationsToReturn, results } = processSearches(
                doc,
                getRegex(searchTerm, disableRegex, caseSensitive),
                searchResultClass,
                resultIndex,
              );

              editor.storage.searchAndReplace.results = results;

              return decorationsToReturn;
            },
          },
          props: {
            decorations(state) {
              return this.getState(state);
            },
          },
        }),
      ];
    },
  }
);

export default SearchAndReplace;