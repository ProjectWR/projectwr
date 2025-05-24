import dataManagerSubdocs from './dataSubDoc';
import MiniSearch from 'minisearch'

let miniSearch = new MiniSearch({
  fields: ['library_name', "library_description", "item_properties", "item_title", "item_descrition", "section_description", "book_description", "paper_xml"],
  storeFields: ["library_name", "item_title", "libraryId", "item_properties", "item_description", "id", "type", "paper_xml"],
  extractField: (document, fieldName) => {
    if (fieldName === "item_properties") {
      return Object.values(document[fieldName]).join(' ');
    }
    else {
      return document[fieldName];
    }
  },
  tokenize: (string) => {
    const tokens = []
    // Match XML/HTML tags OR non-tag text
    const tagRegex = /<\/?[^>\s]+(?:>|$)|([^<]+)/g
    let match

    while ((match = tagRegex.exec(string)) !== null) {
      if (match[1]) { // Text content (not a tag)
        // Split on whitespace, hyphens, punctuation, and other non-word characters
        const textTokens = match[1]
          .split(/[\s\W_]+/) // Split on whitespace, non-word chars, hyphens, and underscores
          .filter(t => t.length > 0)
        tokens.push(...textTokens)
      }
      // Ignore tags (don't add them to tokens)
    }
    return tokens
  }
});

export async function setupSearchForLibrary(libraryId) {
  if (miniSearch.getStoredFields(libraryId)) {
  //  console.log("Already set up search for library: ", libraryId);
    return;
  }
  const ydoc = dataManagerSubdocs.getLibrary(libraryId);
  const libraryDocument = ydoc.getMap("library_props").toJSON();
  const document = { id: libraryId, libraryId: libraryId, ...libraryDocument };
//  console.log("libdoc for search: ", document);

  miniSearch.add(document);



  const callback = () => {
    const libraryDocument = ydoc.getMap("library_props").toJSON();
    const document = { id: libraryId, libraryId: libraryId, ...libraryDocument };
    miniSearch.replace(document);
  };

  ydoc.getMap("library_props").observe(callback);

  const itemCallbacks = new Map();

  for (const [key, value] of ydoc.getMap("library_directory").entries()) {
    if (key === "root") continue
    const itemDocument = value.get("value").toJSON();
  //  console.log("setting up itemdoc for search: ", key, " ", itemDocument);
    miniSearch.add({ id: key, libraryId: libraryId, ...itemDocument });

    const itemCallback = () => {
      // console.log("itemCallback: item ${key} changed");
      const itemDocument = value.get("value").toJSON();
      //  console.log("itemCallback itemDoc replacement: ", itemDocument);
      miniSearch.replace({ id: key, libraryId: libraryId, ...itemDocument });
    }

    itemCallbacks.set(key, itemCallback);
    value.get("value").observeDeep(itemCallback);
  }

  ydoc.getMap("library_directory").observe((event) => {
    event.changes.keys.forEach((change, key) => {
      const value = ydoc.getMap("library_directory").get(key);
      if (change.action === "delete") {
        value.get("value").unobserveDeep(itemCallbacks.get(key));
        miniSearch.remove(key);
      }
      else if (change.action === 'add') {
        const itemDocument = value.get("value").toJSON();
        miniSearch.add({ id: key, libraryId: libraryId, ...itemDocument });

        const itemCallback = () => {
  //        console.log("itemCallback: item ${key} changed");
          const itemDocument = value.get("value").toJSON();
          miniSearch.replace({ id: key, libraryId: libraryId, ...itemDocument });
        }

        itemCallbacks.set(key, itemCallback);
        value.get("value").observeDeep(itemCallback);
      }
    });
  });

  return () => {
    ydoc.getMap("library_props").unobserve(callback);

    itemCallbacks.entries().forEach(([key, value]) => {
      const libDec = ydoc.getMap("library_directory");
      if (libDec.has(key)) {
        libDec.get(key).get("value").unobserveDeep(value);
      }
    });
  };
}

export async function destroySearchForLibrary(libraryId) {
  if (miniSearch.getStoredFields(libraryId)) {
  //  console.log("Already set up search for library: ", libraryId);
    return;
  }
  const ydoc = dataManagerSubdocs.getLibrary(libraryId);

  for (const [key,] of ydoc.getMap("library_directory").entries()) {
    if (key === "root") continue
    miniSearch.remove(key);
  }

  miniSearch.remove(libraryId);
}

export function queryData(query) {
  return miniSearch.search(query, { fuzzy: 0.1 });
}