import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  createSpellCheckEnabledStore,
  createSuggestionBox,
} from "prosemirror-proofread";
import Tokenizr from "tokenizr";
import nspell from "nspell";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import createProofreadPlugin, { spellcheckkey } from "./createProofreadPlugin";
import dictionaryManager from "../../../app/lib/dictionary";

let lexer = new Tokenizr();

lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
  ctx.accept("id");
});
lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
  ctx.accept("number", parseInt(match[0]));
});
lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
  ctx.ignore();
});
lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
  ctx.ignore();
});
lexer.rule(/./, (ctx, match) => {
  ctx.accept("char");
});

const spellCheckStore = createSpellCheckEnabledStore(() => {
  true;
});

const generateProofreadErrors = async (input) => {
  const response = { matches: [] };
  lexer.input(input);
  console.log("INPUT ", input);
  lexer.tokens().forEach((token) => {
    if (token.value.length < 2) return;

    console.log("token", token, token.pos, token.text.length);

    const result = dictionaryManager.userSpellchecker.correct(token.text);

    // const replacements = nspellchecker.suggest(token.value);

    if (!result) {
      response.matches.push({
        offset: token.pos,
        length: token.value.length,
        message: "Possible spelling mistake found.",
        shortMessage: "Spelling error",
        type: { typeName: "UnknownWord" },
      });
    }

    // console.log("token: ", token.toString());
  });

  // console.log("Generated Errors: ", response);
  return response;
  // try {

  // } catch (error) {
  //   console.error("Error:", error);
  //   throw error;
  // }
};

const ProsemirrorProofreadExtension = Extension.create({
  addProseMirrorPlugins() {
    return [
      createProofreadPlugin(
        2000, // Debounce time in ms
        generateProofreadErrors, // function to call proofreading service
        spellCheckStore // Reactive store to toggle spell checking
      ),
    ];
  },

  addCommands() {
    return {
      forceSpellcheck:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta("forceProofread", true);
          }
          return true;
        },
    };
  },
});

export default ProsemirrorProofreadExtension;
