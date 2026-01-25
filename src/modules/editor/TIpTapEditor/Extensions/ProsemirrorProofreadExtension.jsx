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
  binaryInlined,
  BinaryModule,
  Dialect,
  LocalLinter,
  WorkerLinter,
} from "harper.js";
import { message } from "@tauri-apps/plugin-dialog";
import { appStore } from "../../../app/stores/appStore";

let lexer = new Tokenizr();

const baseUrl = window.location.origin;

let linter = new WorkerLinter({
  binary: binaryInlined,
  dialect: Dialect.British,
});

const spellCheckStore = createSpellCheckEnabledStore(() => {
  true;
});

const generateProofreadErrors = async (input) => {
  const response = { matches: [] };
  const delimiter = "\x1F";

  // 1. Build Prefix Sum Array (PSA) for offset mapping
  // psa[i] is the "real offset" (ProseMirror distance) for char input[i]
  const psa = new Array(input.length + 1);
  psa[0] = 0;
  let inDelimited = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === delimiter) {
      if (!inDelimited) {
        // Opening delimiter: count the entire section as 1 distance
        psa[i + 1] = psa[i] + 1;
        inDelimited = true;
      } else {
        // Closing delimiter: already counted, no increment
        psa[i + 1] = psa[i];
        inDelimited = false;
      }
    } else if (inDelimited) {
      // Inside delimited section: no increment
      psa[i + 1] = psa[i];
    } else {
      // Normal character: increment by 1
      psa[i + 1] = psa[i] + 1;
    }
  }

  console.log("PRROFREADING INPUT: ", `-${input}-`);

  // 2. Lint the input (content inside delimiters serves as context)
  const lints = await linter.lint(input);

  for (const lint of lints) {
    const start = lint.span().start;
    const end = lint.span().end;

    // 4. Map offsets and filter out errors inside delimited sections
    const realFrom = psa[start];
    const realTo = psa[end];
    const realLen = realTo - realFrom;

    if (realLen > 0) {
      const replacements = [];
      for (const suggestion of lint.suggestions()) {
        const innerValue = JSON.parse(suggestion.to_json())["inner"];
        if (innerValue && innerValue["ReplaceWith"]) {
          replacements.push(innerValue["ReplaceWith"].join(""));
        }
      }

      const typeName =
        lint.lint_kind() === "Spelling" ? "UnknownWord" : "GrammarError";

      response.matches.push({
        offset: realFrom,
        length: realLen,
        message: lint.message(),
        type: { typeName },
        replacements,
      });
    }
  }

  return response;
};

const ProsemirrorProofreadExtension = Extension.create({
  addProseMirrorPlugins() {
    return [
      createProofreadPlugin(
        2000, // Debounce time in ms
        generateProofreadErrors, // function to call proofreading service
        createSuggestionBox,
        spellCheckStore, // Reactive store to toggle spell checking
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
      contextItems.push({
        label: replacement,
        action: () => {
          if (onReplace) onReplace(replacement);
          container.style.opacity = "0";
          container.style.transform = "translateY(-10px)";
          setTimeout(
            () => appStore.setState({ proofreadContextItems: [] }),
            300,
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
