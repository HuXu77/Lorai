
import * as fs from 'fs';
import * as path from 'path';

// Directories
const PARSERS_DIR = path.join(__dirname, '../engine/parsers');
const EXECUTOR_PATH = path.join(__dirname, '../engine/abilities/executor.ts');

// Regex
const EFFECT_TYPE_REGEX = /type:\s*['"]([a-zA-Z0-9_]+)['"]/g;
const CASE_REGEX = /case\s*['"]([a-zA-Z0-9_]+)['"]:/g;

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

// main
async function main() {
    console.log('🔍 Checking Executor Completeness...');

    // 1. Find all files in parsers
    const files = getAllFiles(PARSERS_DIR);
    const parserTypes = new Set<string>();

    for (const file of files) {
        if (file.includes('.test.ts')) continue;
        const content = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = EFFECT_TYPE_REGEX.exec(content)) !== null) {
            // Filter keywords and generic types
            const type = match[1];
            if (['character', 'item', 'action', 'location'].includes(type)) continue; // Card types
            if (['self', 'all_characters', 'opponent'].includes(type)) continue; // Target types
            if (['during_your_turn', 'while_here'].includes(type)) continue; // Condition types/Targeting
            if (['quest', 'challenge', 'banish'].includes(type)) continue; // Events (sometimes triggers)

            // Heuristic: Effect types are usually snake_case or specific
            parserTypes.add(type);
        }
    }

    // 2. Find all handled cases in Executor
    const executorContent = fs.readFileSync(EXECUTOR_PATH, 'utf-8');
    const handledTypes = new Set<string>();
    let match;
    while ((match = CASE_REGEX.exec(executorContent)) !== null) {
        handledTypes.add(match[1]);
    }

    // 3. Compare
    const missing = Array.from(parserTypes).filter(type => !handledTypes.has(type));

    // Filter known non-effect types (false positives from regex)
    const IGNORED = [
        'triggered', 'static', 'activated', 'keyword',
        'my_characters', 'all_locations', 'card_from_hand',
        'cost', 'lore', 'exert', 'ink', // Costs
        'items_in_play', 'characters_here', 'has_character_here', // Conditions
        'event_occurred', 'while_challenging', 'at_location', // Conditions
        'during_my_turn', 'during_illumineers_turn', // Conditions
        'opponents_turn', 'presence', 'self_exerted', 'hand_empty',
        'while_damaging', 'while_hand_size', 'unless_presence',
        'unless_location', 'this_character', 'opponent_character',
        'move_to_location', 'play', 'play_trigger', 'banish_trigger',
        'quest_trigger', 'challenge_trigger', 'location_cond', 'turn_cond',
        'has_reminder_text', 'any', 'other', 'mine', 'all_players'
    ];

    const realMissing = missing.filter(t => !IGNORED.includes(t));

    console.log(`\n📋 Found ${parserTypes.size} unique types in parsers.`);
    console.log(`✓ Executor handles ${handledTypes.size} types.`);

    if (realMissing.length > 0) {
        console.log(`\n❌ POTENTIALLY MISSING HANDLERS (${realMissing.length}):`);
        realMissing.forEach(t => console.log(`  - ${t}`));
    } else {
        console.log('\n✅ No obvious missing handlers found!');
    }
}

main();
