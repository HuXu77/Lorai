export { };
const text = "Whenever this character quests, look at the top 2 cards of your deck. You may reveal any number of Puppy character cards and put them in your hand. Put the rest on the bottom of your deck in any order.";

const pattern = /whenever this character quests, look at the top (\d+) cards of your deck\. you may reveal (an?|any number of) (.+?) cards? and put (?:it|them) into your hand\. put the rest on the bottom of your deck/i;

const match = text.match(pattern);

console.log(`Text: "${text}"`);
console.log(`Match: ${match ? 'YES' : 'NO'}`);
if (match) {
    console.log(`  amount: ${match[1]}`);
    console.log(`  quantityType: ${match[2]}`);
    console.log(`  cardTypeStr: ${match[3]}`);
}
