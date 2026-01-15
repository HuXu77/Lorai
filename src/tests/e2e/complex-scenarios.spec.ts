import { test, expect } from '@playwright/test';

test.describe('Complex Card Scenarios', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/debug/ui');
    });

    test('Yzma - Stunning Transformation (Target Opposing Character)', async ({ page }) => {
        await page.getByRole('button', { name: /Yzma/ }).click();
        await expect(page.getByText(/Choose an opposing character to banish/)).toBeVisible();

        await expect(page.getByRole('button', { name: 'Simba' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Nala' })).toBeVisible();

        const aurora = page.getByRole('button', { name: 'Aurora' });
        await expect(aurora).toBeVisible();

        await expect(aurora).toHaveClass(/cursor-not-allowed/);
        await expect(aurora.locator('div').first()).toHaveClass(/opacity-40/);
        await expect(page.getByText('Ward').first()).toBeVisible();

        await page.getByRole('button', { name: 'Simba' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();

        const responseJson = await page.locator('pre').textContent();
        expect(responseJson).toContain('"selectedIds":');
        expect(responseJson).toContain('"tm-1"');
    });

    // Skipped due to persistent environmental issues where click does not load scenario
    test('Mulan - Triple Shot (Multi-Target, Up to 2)', async ({ page }) => {
        await page.getByText('Scen Mulan').click();

        await expect(page.getByTestId('choice-modal')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Deal damage to up to 2 other chosen characters/ })).toBeVisible();

        await page.getByRole('button', { name: 'Kronk' }).click();
        await page.getByRole('button', { name: 'Kuzco' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();

        const responseJson = await page.locator('pre').textContent();
        expect(responseJson).toContain('"m-1"');
        expect(responseJson).toContain('"m-3"');
    });

    test('Jafar - Expedient Schemes (Select from Discard)', async ({ page }) => {
        await page.getByRole('button', { name: /Jafar/ }).click();

        await expect(page.getByText(/Choose an action from your discard/)).toBeVisible();

        const bePrepared = page.getByRole('button', { name: 'Be Prepared' });
        await expect(bePrepared).toHaveClass(/cursor-not-allowed/);

        await page.getByRole('button', { name: 'Friends on the Other Side' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();

        const responseJson = await page.locator('pre').textContent();
        expect(responseJson).toContain('"d-1"');
    });

    // Skipped due to persistent environmental issues
    test('Hydra - Watch Your Head (Dynamic Damage)', async ({ page }) => {
        await page.getByText('Scen Hydra').click();

        await expect(page.getByTestId('choice-modal')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Deal damage to chosen character/ })).toBeVisible();

        await page.getByRole('button', { name: 'Hercules' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();

        const responseJson = await page.locator('pre').textContent();
        expect(responseJson).toContain('"h-1"');
    });
});
