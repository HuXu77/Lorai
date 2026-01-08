const text = "At the end of your turn, if this character is exerted, you may draw cards equal to the ¤ of chosen Ally character of yours. If you do, choose and discard 2 cards and banish that character.";

const pattern = /^at the end of your turn, if this character is exerted, you may draw cards equal to the ¤ of chosen (.+?) character(?:\sof yours)?\\. if you do, (.+)/i;

const match = text.match(pattern);

console.log(`Text: "${text}"`);
console.log(`Pattern: ${pattern}`);
console.log(`Match: ${match ? 'YES' : 'NO'}`);
if (match) {
    console.log(`Match[0]: "${match[0]}"`);
    console.log(`Match[1]: "${match[1]}"`);
    console.log(`Match[2]: "${match[2]}"`);
}
