import { test, expect } from '@playwright/test';

test.describe('Sub-Phase 12.1: First Lab Execution (Lab 001: Where Am I?)', () => {
  test('launches Lab 001, renders mission panel, and executes pwd in terminal', async ({ page }) => {
    await page.goto('/');

    // Click "Start Training" or "Resume Training" on Dashboard
    const startTrainingBtn = page.getByRole('button', { name: /(Start|Resume) Training/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Verify Training Workspace is active
    await expect(page.getByRole('heading', { name: /Where Am I\?/i })).toBeVisible();

    // Verify Mission Panel contains Objective and Tasks
    await expect(page.getByText(/Determine your current working directory/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Instructions/i })).toBeVisible();

    // Verify Terminal Action Bar
    await expect(page.getByText('Terminal Shell [student@shellground]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Reset Sandbox/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Validate \(Ctrl\+Enter\)/i })).toBeVisible();

    // Verify Terminal View container
    const terminalHost = page.locator('.terminal-host');
    await expect(terminalHost).toBeVisible();

    // Give terminal a brief moment to finish mount
    await page.waitForTimeout(500);

    // Type 'pwd' followed by Enter into the terminal
    await terminalHost.click();
    await page.keyboard.type('pwd');
    await page.keyboard.press('Enter');

    // Verify terminal buffer contains /workspace
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const host = document.querySelector('.terminal-host') as (Element & { __terminalController?: { getBufferText?: () => string } }) | null;
        return host?.__terminalController?.getBufferText?.() ?? '';
      });
    }, { timeout: 10000 }).toContain('/workspace');
  });
});
