import { resolveResource } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import MiniSearch from 'minisearch'

// https://github.com/fluhus/wordnet-to-json

const EnDictionary = new MiniSearch({
    fields: ["searchWords"],
    storeFields: ["searchWords", "words", "pos", "gloss", "antonyms"]
});

export async function setupEnDictionary() {
    const dictionaryPath = await resolveResource('resources/en-wordnet.json');
    const dictionaryJson = JSON.parse(await readTextFile(dictionaryPath));

    const synset = dictionaryJson["synset"];
    const lemma = dictionaryJson["lemma"];

    Object.entries(synset).forEach(([key, value]) => {
        const document = {
            id: key,
            searchWords: value["word"].join(' '),
            pos: value["pos"],
            words: value["word"].join(' '),
            gloss: value["gloss"].split(";"),
            antonyms: value["pointer"].filter((value) => value["symbol"] == "!").map((value) => value["synset"]),
        };

        EnDictionary.add(document);
    });

    Object.entries(lemma).forEach(([key, value]) => {
        for (const id of value) {
            const storeFields = EnDictionary.getStoredFields(id);

            const newDocument = {
                id: id,
                ...storeFields,
                searchWords: `${storeFields['searchWords']} ${key.substring(key.indexOf('.') + 1)}`
            }

            EnDictionary.replace(newDocument);
        }
    });
}

export function check(word) {
    const result = EnDictionary.search(word);
    return result.length > 0;
}

export function searchWord(word) {
    return EnDictionary.search(word);
}

export function getSuggestionsForIncorrectWord(word) {
    return EnDictionary.search(word, { fuzzy: 0.2 });
}
