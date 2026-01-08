import { CardLoader } from './engine/card-loader';

async function main() {
    console.log('--- Lorcana Effect Parser Test ---');

    const loader = new CardLoader();
    await loader.loadCards();

    // Test Case 1: Ariel - Spectacular Singer (Singer 5, On Play look at top 4)
    // ID 2
    const ariel = loader.getCard(2);
    console.log(`\nChecking Card: ${ariel?.fullName}`);
    if (ariel?.parsedEffects) {
        console.log(`Raw Text: ${JSON.stringify(ariel.abilities)}`);
        ariel.parsedEffects.forEach(e => {
            console.log(`- Trigger: ${e.trigger}, Action: ${e.action}, Target: ${e.target}, Amount: ${e.amount}`);
        });
    }

    // Test Case 2: Goofy - Musketeer (Bodyguard, On Play heal)
    // ID 4
    const goofy = loader.getCard(4);
    console.log(`\nChecking Card: ${goofy?.fullName}`);
    if (goofy?.parsedEffects) {
        goofy.parsedEffects.forEach(e => {
            console.log(`- Trigger: ${e.trigger}, Action: ${e.action}, Target: ${e.target}`);
        });
    }

    // Test Case 3: Hades - Lord of the Underworld (On Play return from discard)
    // ID 6
    const hades = loader.getCard(6);
    console.log(`\nChecking Card: ${hades?.fullName}`);
    if (hades?.parsedEffects) {
        hades.parsedEffects.forEach(e => {
            console.log(`- Trigger: ${e.trigger}, Action: ${e.action}, Target: ${e.target}`);
        });
    }
}

main().catch(console.error);
