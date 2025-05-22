import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { createSpellCheckEnabledStore } from "prosemirror-proofread";
import Tokenizr from "tokenizr";
import nspell from "nspell";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import createProofreadPlugin, { spellcheckkey } from "./createProofreadPlugin";
import dictionaryManager from "../../../app/lib/dictionary";
import {
  binary,
  BinaryModule,
  Dialect,
  LocalLinter,
  WorkerLinter,
} from "harper.js";
import { message } from "@tauri-apps/plugin-dialog";
import { appStore } from "../../../app/stores/appStore";

let lexer = new Tokenizr();

let linter = new LocalLinter({
  binary: new BinaryModule("/src/assets/harper_wasm_bg.wasm"),
  dialect: Dialect.British,
});

lexer.rule(/[a-zA-Z](?:[a-zA-Z0-9]|'(?=[a-zA-Z]))*/, (ctx, match) => {
  // Handles contractions like don't, couldn't, etc.
  ctx.accept("word", match[0]);
});

lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
  ctx.accept("number", parseInt(match[0]));
});

lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
  ctx.ignore(); // Comments
});

lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
  ctx.ignore(); // Whitespace
});

lexer.rule(/./, (ctx, match) => {
  ctx.accept("char"); // Catch-all for punctuation
});

const spellCheckStore = createSpellCheckEnabledStore(() => {
  true;
});

const generateProofreadErrors = async (input) => {
  const response = { matches: [] };
  // lexer.input(input);

  console.log("INPUT: ", input);

  const lints = await linter.lint(input);

  for (const lint of lints) {
    console.log(lint.to_json());

    const replacements = [];

    for (const suggestion of lint.suggestions()) {
      console.log("Suggestions: ", suggestion.to_json());
      const innerValue = JSON.parse(suggestion.to_json())["inner"];
      console.log("INNER VALUE: ", innerValue);
      if (innerValue && innerValue["ReplaceWith"]) {
        console.log("Inner value replace with: ", innerValue["ReplaceWith"]);
        replacements.push(innerValue["ReplaceWith"].join(""));
      }
    }

    if (lint.lint_kind() === "Spelling") {
      response.matches.push({
        offset: lint.span().start,
        length: lint.span().len(),
        message: lint.message(),
        type: { typeName: "UnknownWord" },
        replacements: replacements,
      });
    } else
      response.matches.push({
        offset: lint.span().start,
        length: lint.span().len(),
        message: lint.message(),
        type: { typeName: "GrammarError" },
        replacements: replacements,
      });
  }

  // lexer.tokens().forEach((token) => {
  //   if (token.value.length < 2) return;

  //   let result = dictionaryManager.userSpellchecker.correct(token.text);
  //   if (token.text.indexOf("'") != -1) {
  //     result =
  //       result ||
  //       dictionaryManager.userSpellchecker.correct(token.text.split("'")[0]);
  //   }

  //   // const replacements = nspellchecker.suggest(token.value);

  //   if (!result) {
  //     response.matches.push({
  //       offset: token.pos,
  //       length: token.value.length,
  //       message: "Possible spelling mistake found.",
  //       shortMessage: "Spelling error",
  //       type: { typeName: "UnknownWord" },
  //     });
  //   }
  // });

  console.log("RESPONSE MATCHES: ", response.matches);

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
        createSuggestionBox,
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

function createSuggestionBox({
  error,
  position,
  onReplace,
  onIgnore,
  onClose,
}) {
  const contextItems = [];

  const existingBox = document.querySelector(".proofread-suggestion");
  if (existingBox) {
    existingBox.remove();
  }

  const container = document.createElement("div");
  container.className = "proofread-suggestion";
  container.style.position = "fixed";
  container.style.display = "block";

  container.style.zIndex = "50";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid hsl(var(--appLayoutBorder))";
  container.style.padding = "1rem";
  container.style.boxShadow =
    "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)";
  container.style.borderRadius = "0.2rem";
  container.style.maxWidth = "20rem";
  container.style.left = `${position.x}px`;
  container.style.top = `${position.y}px`;
  container.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  container.style.opacity = "0";
  container.style.transform = "translateY(-10px)";

  setTimeout(() => {
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
  }, 10);

  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.justifyContent = "space-between";
  content.style.alignItems = "center";
  content.style.marginBottom = "0.5rem";

  const message = document.createElement("p");
  message.style.color = "#1F2937";
  message.style.margin = "0";
  message.style.fontSize = "1rem";
  message.style.flex = "1";
  message.textContent = error.msg;

  const closeButton = document.createElement("button");
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.border = "none";
  closeButton.style.cursor = "pointer";
  closeButton.style.display = "flex";
  closeButton.style.alignItems = "center";
  closeButton.style.justifyContent = "center";
  closeButton.style.padding = "0";
  closeButton.style.marginLeft = "1rem";

  closeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>`;

  closeButton.addEventListener("click", () => {
    container.style.opacity = "0";
    container.style.transform = "translateY(-10px)";
    setTimeout(() => appStore.setState({ proofreadContextItems: [] }), 300);
    if (onClose) onClose();
  });

  content.appendChild(message);
  content.appendChild(closeButton);
  container.appendChild(content);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.flexWrap = "wrap";
  buttonsContainer.style.gap = "0.5rem";

  if (error.replacements && error.replacements.length > 0) {
    error.replacements.slice(0, 3).forEach((replacement) => {
      console.log("REPLACEMENT: ", replacement);

      contextItems.push({
        label: replacement,
        action: () => {
          if (onReplace) onReplace(replacement);
          container.style.opacity = "0";
          container.style.transform = "translateY(-10px)";
          setTimeout(
            () => appStore.setState({ proofreadContextItems: [] }),
            300
          );
        },
      });

      const replaceButton = document.createElement("button");
      replaceButton.style.backgroundColor = "#3B82F6";
      replaceButton.style.color = "white";
      replaceButton.style.padding = "0.5rem 1rem";
      replaceButton.style.borderRadius = "0.375rem";
      replaceButton.style.cursor = "pointer";
      replaceButton.style.border = "none";
      replaceButton.style.outline = "none";
      replaceButton.style.fontSize = "0.875rem";
      replaceButton.style.transition = "background-color 0.2s ease";

      replaceButton.textContent = replacement;
      replaceButton.addEventListener("click", () => {
        if (onReplace) onReplace(replacement);
        container.style.opacity = "0";
        container.style.transform = "translateY(-10px)";
        setTimeout(() => appStore.setState({ proofreadContextItems: [] }), 300);
      });

      replaceButton.addEventListener("mouseenter", () => {
        replaceButton.style.backgroundColor = "#2563EB";
      });
      replaceButton.addEventListener("mouseleave", () => {
        replaceButton.style.backgroundColor = "#3B82F6";
      });

      buttonsContainer.appendChild(replaceButton);
    });
  } else {
    contextItems.push({
      label: "No replacements available",
      action: null,
    });
    const noReplacement = document.createElement("p");
    noReplacement.style.color = "#9CA3AF";
    noReplacement.style.margin = "0";
    noReplacement.style.fontSize = "0.875rem";
    noReplacement.textContent = "No replacements available";
    buttonsContainer.appendChild(noReplacement);
  }

  contextItems.push({
    label: "Ignore",
    action: () => {
      if (onIgnore) onIgnore();
      container.style.opacity = "0";
      container.style.transform = "translateY(-10px)";
      setTimeout(() => appStore.setState({ proofreadContextItems: [] }), 300);
    },
  });

  const ignoreButton = document.createElement("button");
  ignoreButton.style.backgroundColor = "#6B7280";
  ignoreButton.style.color = "white";
  ignoreButton.style.padding = "0.5rem 1rem";
  ignoreButton.style.borderRadius = "0.375rem";
  ignoreButton.style.cursor = "pointer";
  ignoreButton.style.border = "none";
  ignoreButton.style.outline = "none";
  ignoreButton.style.fontSize = "0.875rem";
  ignoreButton.style.transition = "background-color 0.2s ease";

  ignoreButton.textContent = "Ignore";
  ignoreButton.addEventListener("click", () => {
    if (onIgnore) onIgnore();
    container.style.opacity = "0";
    container.style.transform = "translateY(-10px)";
    setTimeout(() => appStore.setState({ proofreadContextItems: [] }), 300);
  });

  ignoreButton.addEventListener("mouseenter", () => {
    ignoreButton.style.backgroundColor = "#4B5563";
  });
  ignoreButton.addEventListener("mouseleave", () => {
    ignoreButton.style.backgroundColor = "#6B7280";
  });

  buttonsContainer.appendChild(ignoreButton);
  container.appendChild(buttonsContainer);

  // document.body.appendChild(container);

  // setProofreadContextItems(contextItems);

  appStore.setState({ proofreadContextItems: contextItems });

  console.log("SUGGESTIONG BOX CREATED");

  const handleScroll = () => {
    container.style.opacity = "0";
    container.style.transform = "translateY(-10px)";
    setTimeout(() => appStore.setState({ proofreadContextItems: [] }), 300);
    window.removeEventListener("scroll", handleScroll);
  };

  window.addEventListener("scroll", handleScroll);

  return {
    destroy: () => {
      window.removeEventListener("scroll", handleScroll);
      appStore.setState({ proofreadContextItems: [] });
    },
  };
}
