import { test, expect } from '@playwright/test';

test.describe('Sub-Phase 12.1: Lab Validation & Scoring Feedback', () => {
  test('completes Lab 001 verification and renders validation pass modal', async ({ page }) => {
    await page.goto('/');

    // Start training from Dashboard
    const startTrainingBtn = page.getByRole('button', { name: /(Start|Resume) Training/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Verify Training Workspace is active
    await expect(page.getByRole('heading', { name: /Where Am I\?/i })).toBeVisible();

    // Focus terminal host and execute pwd
    const terminalHost = page.locator('.terminal-host');
    await expect(terminalHost).toBeVisible();
    await page.waitForTimeout(500);

    await terminalHost.click();
    await page.keyboard.type('pwd');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Trigger validation
    const validateBtn = page.getByRole('button', { name: /Validate \(Ctrl\+Enter\)/i });
    await expect(validateBtn).toBeEnabled();
    await validateBtn.click();

    // Verify validation modal opens with success state
    const dialog = page.getByRole('dialog', { name: /Verification Succeeded/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: /Lab Passed — Criteria Satisfied/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Competency Scoring Breakdown/i })).toBeVisible();
    await expect(page.getByText('check-cwd')).toBeVisible();

    // Verify modal action buttons and close
    const reviewBtn = page.getByRole('button', { name: /Review Terminal/i });
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    // Modal should close
    await expect(dialog).not.toBeVisible();
  });
});
