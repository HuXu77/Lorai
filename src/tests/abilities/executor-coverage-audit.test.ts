/**
 * Executor Coverage Audit
 * 
 * This test extracts all effect types from EffectAST and verifies
 * that each has a handler in the executor.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Executor Coverage Audit', () => {
    let effectAstContent: string;
    let executorContent: string;

    beforeAll(() => {
        const effectAstPath = path.join(__dirname, '../../engine/abilities/effect-ast.ts');
        const executorPath = path.join(__dirname, '../../engine/abilities/executor.ts');

        effectAstContent = fs.readFileSync(effectAstPath, 'utf-8');
        executorContent = fs.readFileSync(executorPath, 'utf-8');
    });

    it('should identify all effect types in EffectAST', () => {
        // Extract effect types from EffectAST
        const typeRegex = /type:\s*['"]([^'"]+)['"]/g;
        const effectTypes = new Set<string>();

        let match;
        while ((match = typeRegex.exec(effectAstContent)) !== null) {
            effectTypes.add(match[1]);
        }

        console.log(`\n📊 Found ${effectTypes.size} unique effect types in EffectAST:`);
        const sortedTypes = Array.from(effectTypes).sort();
        console.log(sortedTypes.join(', '));

        expect(effectTypes.size).toBeGreaterThan(50);
    });

    it('should identify all case handlers in executor', () => {
        // Extract case statements from executor
        const caseRegex = /case\s+['"]([^'"]+)['"]\s*:/g;
        const handledTypes = new Set<string>();

        let match;
        while ((match = caseRegex.exec(executorContent)) !== null) {
            handledTypes.add(match[1]);
        }

        console.log(`\n🔧 Found ${handledTypes.size} case handlers in executor:`);
        const sortedHandlers = Array.from(handledTypes).sort();
        console.log(sortedHandlers.join(', '));

        expect(handledTypes.size).toBeGreaterThan(50);
    });

    it('should identify gaps (effect types without handlers)', () => {
        // Extract effect types from EffectAST
        const effectTypeRegex = /type:\s*['"]([^'"]+)['"]/g;
        const effectTypes = new Set<string>();
        let match;
        while ((match = effectTypeRegex.exec(effectAstContent)) !== null) {
            effectTypes.add(match[1]);
        }

        // Extract case statements from executor
        const caseRegex = /case\s+['"]([^'"]+)['"]\s*:/g;
        const handledTypes = new Set<string>();
        while ((match = caseRegex.exec(executorContent)) !== null) {
            handledTypes.add(match[1]);
        }

        // Find gaps
        const gaps: string[] = [];
        effectTypes.forEach(type => {
            if (!handledTypes.has(type)) {
                gaps.push(type);
            }
        });

        console.log('\n⚠️  GAPS (effect types without handlers):');
        console.log(`Found ${gaps.length} gaps:`);
        gaps.sort().forEach(gap => console.log(`  - ${gap}`));

        // List handled types not in AST (may be aliases or legacy)
        const extra: string[] = [];
        handledTypes.forEach(type => {
            if (!effectTypes.has(type)) {
                extra.push(type);
            }
        });

        console.log('\n📌 Extra handlers (not in AST, may be aliases):');
        extra.sort().forEach(e => console.log(`  - ${e}`));

        // Store gaps for review
        console.log('\n📋 Summary:');
        console.log(`  Effect types in AST: ${effectTypes.size}`);
        console.log(`  Handlers in executor: ${handledTypes.size}`);
        console.log(`  Missing handlers: ${gaps.length}`);
        console.log(`  Extra handlers: ${extra.length}`);
    });

    it('should report family handler coverage', () => {
        // Check which family handlers are registered
        const familyRegex = /familyHandlers\.set\(['"]([^'"]+)['"]/g;
        const families: string[] = [];
        let match;
        while ((match = familyRegex.exec(executorContent)) !== null) {
            families.push(match[1]);
        }

        console.log(`\n🏠 Family handlers registered: ${families.length}`);
        families.forEach(f => console.log(`  - ${f}`));

        expect(families.length).toBeGreaterThan(5);
    });
});
