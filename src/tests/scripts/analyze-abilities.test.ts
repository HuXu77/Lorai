
import { describe, it } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Ability Analysis Script', () => {
    it('should generate ability inventory report', () => {
        try {
            execSync('npx tsx scripts/analyze-abilities.ts', { stdio: 'inherit' });

            const reportPath = path.join(process.cwd(), 'docs', 'ability_inventory.md');
            if (fs.existsSync(reportPath)) {
                console.log('Report generated successfully.');
            } else {
                throw new Error('Report file was not created.');
            }
        } catch (error) {
            console.error('Script execution failed:', error);
            throw error;
        }
    });
});
