import { Extension } from "@tiptap/core";
import {
  createProofreadPlugin,
  createSpellCheckEnabledStore,
  createSuggestionBox,
} from "prosemirror-proofread";

let resultHandler = (results) =>
  console.log(
    "Results : ",
    results.map((result) => result.term)
  );

const generateProofreadErrors = (input) => {
  console.log("input: ", input);
  return {
    matches: [],
  };
};

const spellCheckStore = createSpellCheckEnabledStore(() => { true; });

const proofreadPlugin = createProofreadPlugin(
  1000, // Debounce time in ms
  generateProofreadErrors, // function to call proofreading service
  createSuggestionBox, // Suggestion box function
  spellCheckStore // Reactive store to toggle spell checking
);

const ProofreaderExtension = Extension.create({
  name: "Proofreader",

  addProseMirrorPlugins() {
    return [proofreadPlugin];
  },
});

export default ProofreaderExtension;