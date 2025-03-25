import { Extension } from "@tiptap/core";
import {
  createProofreadPlugin,
  createSpellCheckEnabledStore,
  createSuggestionBox,
} from "prosemirror-proofread";
import Tokenizr from "tokenizr";

import dictionary from "dictionary-en";
import nspell from "nspell";

const nspellchecker = nspell({ aff: dictionary.aff, dic: dictionary.dic });

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

    if (!result) {
      response.matches.push({
        offset: token.pos,
        length: token.value.length,
        message: "Possible spelling mistake found.",
        shortMessage: "Spelling error",
        type: { typeName: "UnknownWord" },
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
        createSuggestionBox, // Suggestion box function
        spellCheckStore // Reactive store to toggle spell checking
      ),
    ];
  },
});

export default ProsemirrorProofreadExtension;
