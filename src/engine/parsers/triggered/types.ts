import { AbilityDefinition, Card } from '../parser-utils';

export interface TriggerPattern {
    // Regex to identify the trigger
    pattern: RegExp;
    // Function to create the ability definition from the match
    handler: (match: RegExpMatchArray, card: Card, text: string) => AbilityDefinition | AbilityDefinition[] | null;
}
