import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

import { createVirtualCursor } from 'prosemirror-virtual-cursor';

const pluginKey = new PluginKey("virtualCursor");

const ProsemirrorVirtualCursor = Extension.create({
    name: "prosemirrorVirtualCursor",

    addProseMirrorPlugins() {
        return [createVirtualCursor()]
    }
});

export default ProsemirrorVirtualCursor;