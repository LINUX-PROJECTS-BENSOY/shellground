import { test, expect } from '@playwright/test';

test.describe('Sub-Phase 12.1: Local-First Progress Persistence Across Reloads', () => {
  test('persists completed lab progress in IndexedDB across browser reloads', async ({ page }) => {
    await page.goto('/');

    // Clean any prior stored lab progress for a fresh test run
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        try {
          const req = indexedDB.open('shellground_db');
          req.onsuccess = () => {
            const db = req.result;
            if (db.objectStoreNames.contains('labProgress')) {
              const tx = db.transaction('labProgress', 'readwrite');
              tx.objectStore('labProgress').clear();
              tx.oncomplete = () => {
                db.close();
                resolve();
              };
              tx.onerror = () => {
                db.close();
                resolve();
              };
            } else {
              db.close();
              resolve();
            }
          };
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    });
    await page.reload();

    // Verify initial progress is 0/20 in header
    await expect(page.getByText('0/20')).toBeVisible();

    // Start training
    const startTrainingBtn = page.getByRole('button', { name: /(Start|Resume) Training/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Focus terminal and run pwd
    const terminalHost = page.locator('.terminal-host');
    await expect(terminalHost).toBeVisible();
    await page.waitForTimeout(500);

    await terminalHost.click();
    await page.keyboard.type('pwd');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Validate
    const validateBtn = page.getByRole('button', { name: /Validate \(Ctrl\+Enter\)/i });
    await validateBtn.click();

    // Verify success modal
    const dialog = page.getByRole('dialog', { name: /Verification Succeeded/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Review terminal to close modal
    await page.getByRole('button', { name: /Review Terminal/i }).click();
    await expect(dialog).not.toBeVisible();

    // Progress badge in header should now be 1/20
    await expect(page.getByText('1/20')).toBeVisible();

    // Navigate to Dashboard
    await page.getByRole('button', { name: />_ SHELLGROUND/i }).click();
    await expect(page.getByText(/1 of 20 labs verified/i)).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify progress survives browser refresh (IndexedDB local-first storage)
    await expect(page.getByText('1/20')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/1 of 20 labs verified/i)).toBeVisible();

    // Action button should now read "Resume Training"
    await expect(page.getByRole('button', { name: /Resume Training/i })).toBeVisible();
  });
});
