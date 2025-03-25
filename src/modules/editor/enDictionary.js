import { resolveResource } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import Fuse from 'fuse.js'
// https://github.com/fluhus/wordnet-to-json

// const EnDictionary = new MiniSearch({
//     fields: ["searchWords"],
//     storeFields: ["searchWords", "words", "pos", "gloss", "antonyms"]
// });

const fuseOptions = { keys: ['searchWords'], useExtendedSearch: true, threshold: 0.1 };

/** @type {Fuse} */
let EnDictionary = null;

const map = new Map();

const exceptionMap = new Map();

export async function setupEnDictionary() {
    const dictionaryPath = await resolveResource('resources/en-wordnet.json');
    const dictionaryJson = JSON.parse(await readTextFile(dictionaryPath));

    const synset = dictionaryJson["synset"];
    const lemma = dictionaryJson["lemma"];
    const exception = dictionaryJson["exception"];

    Object.entries(synset).forEach(([key, value]) => {
        const document = {
            id: key,
            searchWords: value["word"],
            pos: value["pos"],
            words: value["word"],
            gloss: value["gloss"].split(";"),
            antonyms: value["pointer"].filter((value) => value["symbol"] == "!").map((value) => value["synset"]),
        };

        map.set(key, document);
    });

    Object.entries(lemma).forEach(([key, value]) => {
        for (const id of value) {
            const storeFields = map.get(id);

            const newDocument = {
                id: id,
                ...storeFields,
                searchWords: [...storeFields['searchWords'], key.substring(key.indexOf('.') + 1)]
            }

            if (key.substring(key.indexOf('.') + 1) === 'be') {
                console.log("be: ", newDocument);
            }

            map.set(id, newDocument);
        }
    });

    Object.entries(exception).forEach(([key, value]) => {
        const keyWord = key.substring(key.indexOf('.') + 1);
        for (const i of value) {
            const word = i.substring(i.indexOf('.') + 1);
            if (exceptionMap.has(keyWord)) {
                exceptionMap.get(keyWord).push(word);
            } else {
                exceptionMap.set(keyWord, [word]);
            }

        }
    })

    const array = Array.from(map, ([, value]) => value);

    // console.log("Checking array data structure: ", array);

    EnDictionary = new Fuse(array, fuseOptions, Fuse.createIndex(fuseOptions.keys, array));

    console.log("Test Query for Fuse: ", exceptionMap.get("is"), getExactMatch("is"));
}

export function getExactMatch(word) {
    const result = [];
    const queryResult = EnDictionary.search(`=${word}`);
    if (queryResult.length > 0) {
        result.push(...queryResult);
    }

    exceptionMap.get(word)?.forEach((word) => {
        const queryResult = EnDictionary.search(`=${word}`);
        if (queryResult.length > 0) {
            result.push(...queryResult);
        }
    })

    console.log("checking new result logic: ", result);

    return result;
}