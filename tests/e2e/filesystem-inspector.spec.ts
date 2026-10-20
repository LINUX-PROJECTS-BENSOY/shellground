import { test, expect } from '@playwright/test';

test.describe('Upgrade Option 1: Live Visual Filesystem Inspector & Tree Explorer', () => {
  test('toggles filesystem tree, detects live file mutations (+NEW), and inspects file details', async ({ page }) => {
    await page.goto('/');

    // Start training
    const startTrainingBtn = page.getByRole('button', { name: /(Start|Resume) Training/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Verify terminal action bar is visible
    const fsToggleBtn = page.getByRole('button', { name: /Filesystem/i });
    await expect(fsToggleBtn).toBeVisible();

    // Toggle open the Filesystem Inspector
    await fsToggleBtn.click();

    // Verify Filesystem Tree panel rendered
    await expect(page.getByText('Filesystem Tree')).toBeVisible();
    await expect(page.getByRole('tree', { name: /Virtual Filesystem Directory Tree/i })).toBeVisible();

    // Execute command to create a new file in terminal
    const terminalHost = page.locator('.terminal-host');
    await expect(terminalHost).toBeVisible();
    await terminalHost.click();

    await page.keyboard.type('touch /workspace/inspector_canary.txt');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);

    // Verify new file appears in tree with "+ NEW" badge
    const newFileNode = page.getByRole('treeitem').filter({ hasText: 'inspector_canary.txt' });
    await expect(newFileNode).toBeVisible();
    await expect(newFileNode.getByText('+ NEW')).toBeVisible();

    // Verify recent mutation pill shows the command
    await expect(page.getByText(/Cmd: touch \/workspace\/inspector_canary\.txt/i)).toBeVisible();

    // Click on file to open File Inspector Modal
    await newFileNode.click();

    // Verify File Inspector dialog
    const inspectorDialog = page.getByRole('dialog', { name: /File Inspector: inspector_canary\.txt/i });
    await expect(inspectorDialog).toBeVisible();
    await expect(inspectorDialog.getByText('Mode:')).toBeVisible();
    await expect(inspectorDialog.getByRole('button', { name: /Copy Path/i })).toBeVisible();

    // Close the File Inspector Modal
    await inspectorDialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(inspectorDialog).not.toBeVisible();
  });

  test('provides full mobile Filesystem tab switcher and back navigation', async ({ page }) => {
    // Set mobile viewport (iPhone 14 / mobile standard)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const startTrainingBtn = page.getByRole('button', { name: /(Start|Resume) Training/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Verify mobile tab bar includes Files tab
    const filesTabBtn = page.getByRole('button', { name: 'Files', exact: true });
    await expect(filesTabBtn).toBeVisible();

    // Switch to Files tab
    await filesTabBtn.click();

    // Verify mobile Filesystem Tree panel is active
    await expect(page.getByText('Filesystem Tree')).toBeVisible();
    await expect(page.getByRole('tree', { name: /Virtual Filesystem Directory Tree/i })).toBeVisible();

    // Verify "Back to Terminal" button and click it
    const backBtn = page.getByRole('button', { name: /Back to Terminal/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Verify terminal view restored
    await expect(page.locator('.terminal-host')).toBeVisible();
  });
});
