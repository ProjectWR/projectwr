import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "./dataSubDoc";

export function getAncestorsForBreadcrumbs(libraryId, itemId) {
    if (
        !dataManagerSubdocs.getLibrary(libraryId) ||
        !checkForYTree(
            dataManagerSubdocs
                .getLibrary(libraryId)
                .getMap("library_directory")
        )
    ) {
        return null;
    }

    const ytree = new YTree(
        dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_directory")
    );

    const ancestors = [itemId];

    while (true) {
        try {
            ancestors.unshift(
                ytree.getNodeParentFromKey(ancestors[0])
            );
        } catch {
            break;
        }
    }

    ancestors.shift();

    ancestors.unshift(libraryId);

    return ancestors;
}