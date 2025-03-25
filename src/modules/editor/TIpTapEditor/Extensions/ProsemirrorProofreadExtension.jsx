import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  createSpellCheckEnabledStore,
  createSuggestionBox,
} from "prosemirror-proofread";
import Tokenizr from "tokenizr";
import nspell from "nspell";
import { resolveResource } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import createProofreadPlugin from "./createProofreadPlugin";

/** @type {nspell} */
let nspellchecker;

export async function setupNspellchecker() {
  const aff = await readTextFile(await resolveResource('resources/index.aff'));
  const dic = await readTextFile(await resolveResource('resources/index.dic'));

  nspellchecker = nspell({ aff: aff, dic: dic });
}

let lexer = new Tokenizr();

lexer.rule(/[a-zA-Z0-9_-][a-zA-Z0-9_-]*/, (ctx, match) => {
  ctx.accept("id");
});
lexer.rule(/"((?:\\"|[^\r\n])*)"/, (ctx, match) => {
  ctx.accept("string", match[1].replace(/\\"/g, '"'));
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
  lexer.tokens().forEach((token) => {
    if (token.value.length < 2) return;

    const result = nspellchecker.correct(token.value);

    const replacements = nspellchecker.suggest(token.value);

    if (!result) {
      response.matches.push({
        offset: token.pos,
        length: token.value.length,
        message: "Possible spelling mistake found.",
        shortMessage: "Spelling error",
        type: { typeName: "UnknownWord" },
        replacements
      });
    }

    console.log("token: ", token.toString());
  });

  console.log("Generated Errors: ", response);
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
        1000, // Debounce time in ms
        generateProofreadErrors, // function to call proofreading service
        spellCheckStore // Reactive store to toggle spell checking
      ),
    ];
  },
});

export default ProsemirrorProofreadExtension;
