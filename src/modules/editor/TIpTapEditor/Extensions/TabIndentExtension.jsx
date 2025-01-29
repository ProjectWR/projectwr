import { Extension } from "@tiptap/core";

const TabKeyExtension = Extension.create({
  name: "tabKey",

  // Add configurable options
  addOptions() {
    return {
      spaces: 4, // Default to 4 spaces
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const spaces = " ".repeat(this.options.spaces);
        editor.chain().insertContent(spaces).run();
        return true; // Prevent default behavior
      },
    };
  },
});

export default TabKeyExtension;
