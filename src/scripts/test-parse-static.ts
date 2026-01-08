import { parseStaticEffects } from '../engine/parsers/static-effect-parser';

const texts = [
    "banish this character",
    "you may draw cards equal to the ¤ of chosen Ally character of yours",
];

texts.forEach(text => {
    const effects = parseStaticEffects(text);
    console.log(`Text: "${text}"`);
    console.log(`Effects: ${effects.length > 0 ? JSON.stringify(effects, null, 2) : '(none)'}\n`);
});
