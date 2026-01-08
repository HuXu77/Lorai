import { parseStaticEffects } from '../engine/parsers/static-effect-parser';

const texts = [
    "this character gains Resist +1 and Ward",
    "this character gains Resist +1",
    "this character gains Ward"
];

texts.forEach(text => {
    const effects = parseStaticEffects(text);
    console.log(`\nText: "${text}"`);
    console.log(`Effects: ${effects.length}`);
    effects.forEach((e, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(e, null, 2).substring(0, 100)}...`);
    });
});
