import { test, expect } from '@playwright/test';

test.describe('Sub-Phase 12.1: Deterministic Lab Sandbox Reset', () => {
  test('mutates sandbox state, triggers reset, and verifies clean state recreation', async ({ page }) => {
    await page.goto('/');

    // Start training
    const startTrainingBtn = page.getByRole('button', { name: /(Start|Resume) Training/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Verify initial attempt #1 in status bar
    await expect(page.getByText(/Active Session — Attempt #1/i)).toBeVisible();

    const terminalHost = page.locator('.terminal-host');
    await expect(terminalHost).toBeVisible();
    await page.waitForTimeout(500);

    // Mutate filesystem by touching a test file
    await terminalHost.click();
    await page.keyboard.type('touch /workspace/mutation_canary.txt');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    await page.keyboard.type('ls /workspace');
    await page.keyboard.press('Enter');

    // Confirm mutation appears in buffer
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const host = document.querySelector('.terminal-host') as (Element & { __terminalController?: { getBufferText?: () => string } }) | null;
        return host?.__terminalController?.getBufferText?.() ?? '';
      });
    }, { timeout: 10000 }).toContain('mutation_canary.txt');

    // Click "Reset Sandbox" button
    const resetBtn = page.getByRole('button', { name: /Reset Sandbox/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify attempt counter increments to Attempt #2
    await expect(page.getByText(/Active Session — Attempt #2/i)).toBeVisible();

    // Verify fresh welcome banner emitted
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const host = document.querySelector('.terminal-host') as (Element & { __terminalController?: { getBufferText?: () => string } }) | null;
        return host?.__terminalController?.getBufferText?.() ?? '';
      });
    }, { timeout: 10000 }).toContain('WASIX Sandbox: Initialized & Isolated');

    // In fresh session, list workspace files
    await terminalHost.click();
    await page.keyboard.type('ls /workspace');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verify pristine fixture file welcome.txt is listed
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const host = document.querySelector('.terminal-host') as (Element & { __terminalController?: { getBufferText?: () => string } }) | null;
        const text = host?.__terminalController?.getBufferText?.() ?? '';
        const parts = text.split('WASIX Sandbox: Initialized & Isolated');
        return parts[parts.length - 1] ?? '';
      });
    }, { timeout: 10000 }).toContain('welcome.txt');

    // Verify mutation_canary.txt is not present in the new session's ls output
    const buffer = await page.evaluate(() => {
      const host = document.querySelector('.terminal-host') as (Element & { __terminalController?: { getBufferText?: () => string } }) | null;
      const text = host?.__terminalController?.getBufferText?.() ?? '';
      const parts = text.split('WASIX Sandbox: Initialized & Isolated');
      return parts[parts.length - 1] ?? '';
    });
    expect(buffer).not.toContain('mutation_canary.txt');
  });
});
