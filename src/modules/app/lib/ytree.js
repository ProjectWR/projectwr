import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "./dataSubDoc";

const ytreeLocalMap = new Map();

export function getOrInitLibraryYTree(libraryId) {
    try {
        if (ytreeLocalMap.has(libraryId)) {
            return ytreeLocalMap.get(libraryId);
        }
        else {
            if (
                !checkForYTree(
                    dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
                )
            ) {
                throw new Error("Tried to access uninitialized directory");
            }

            const libraryYTree = new YTree(
                dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
            );

            return libraryYTree;
        }
    } catch (e) {
        throw new Error("Error fetching or initiating library in ytreeLocalManager: ", e)
    }
}