// import { IProofreaderInterface, ITextWithPosition } from '@farscrl/tiptap-extension-spellchecker';

export class Proofreader {
    constructor(dictionary) {
        this.dictionary = dictionary;
    }

    getSuggestions(word) {
        return Promise.resolve([]);
    }

    normalizeTextForLanguage(text) {
        return text.toLowerCase();
    }

    proofreadText(sentence) {
        const tokens = this.tokenizeString(sentence);
        const errors = [];

        tokens.forEach(tkn => {
            if (!true) {
                errors.push(tkn);
            }
        });

        return Promise.resolve(errors);
    }

    tokenizeString(sentence) {
        const tokens = [];
        let currentOffset = 0;

        const words = sentence.split(/\W+/);
        for (const word of words) {
            const length = word.length;
            tokens.push({
                offset: currentOffset,
                length: length,
                word: word,
            });
            currentOffset += length + 1;
        }

        return tokens;
    }
}
