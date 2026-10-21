import { test, expect } from '@playwright/test';

test.describe('Showcase Landing Page ("Main Tab")', () => {
  test('renders hero showcase billboard, badges, and interactive terminal simulator', async ({ page }) => {
    await page.goto('/');

    // Verify billboard headline
    await expect(
      page.getByRole('heading', { name: /Master the Linux Terminal/i })
    ).toBeVisible();

    // Verify key assurance badges
    await expect(page.getByText('100% Client-Side WASM')).toBeVisible();
    await expect(page.getByText('Zero Network Egress')).toBeVisible();
    await expect(page.getByText('<50ms Instant Spinup')).toBeVisible();

    // Verify interactive terminal simulator box
    await expect(page.getByText('guest@shellground: ~/workspace (wasix-v1.4)')).toBeVisible();
    await expect(page.getByText('tree -L 2 /workspace')).toBeVisible();

    // Click interactive "ls -la" chip
    const lsChip = page.getByRole('button', { name: /ls -la/i });
    await expect(lsChip).toBeVisible();
    await lsChip.click();

    // Verify simulated typing and output
    await expect(page.getByText('guest@shellground:~/workspace$ ls -la')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('.bashrc')).toBeVisible();

    // Click interactive "os-release" chip
    const osChip = page.getByRole('button', { name: /os-release/i });
    await expect(osChip).toBeVisible();
    await osChip.click();

    // Verify os-release output
    await expect(page.getByText(/PRETTY_NAME="ShellGround WASIX WebAssembly Kernel/i)).toBeVisible({ timeout: 5000 });
  });

  test('navigates to Playground and returns to Showcase via brand button', async ({ page }) => {
    await page.goto('/');

    // Click "Open Freeform Playground"
    const playgroundBtn = page.getByRole('button', { name: /Open Freeform Playground/i });
    await expect(playgroundBtn).toBeVisible();
    await playgroundBtn.click();

    // Verify in Playground
    await expect(page.getByText('Open Command Playground')).toBeVisible();

    // Click brand logo in header to return to Showcase
    const brandBtn = page.getByRole('button', { name: />_ SHELLGROUND/i });
    await expect(brandBtn).toBeVisible();
    await brandBtn.click();

    // Verify returned to Showcase
    await expect(
      page.getByRole('heading', { name: /Master the Linux Terminal/i })
    ).toBeVisible();
  });

  test('toggles seamlessly between Top-Level Tab Bar (Main / Showcase vs ShellGround Web App)', async ({ page }) => {
    await page.goto('/');

    const tabMain = page.getByTestId('tab-main');
    const tabApp = page.getByTestId('tab-app');

    // 1. Initial state: Main Tab is active, sidebar is hidden
    await expect(tabMain).toBeVisible();
    await expect(tabApp).toBeVisible();
    await expect(tabMain).toHaveAttribute('aria-selected', 'true');
    await expect(tabApp).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('nav-dashboard')).not.toBeVisible();

    // 2. Click ShellGround Web App tab: switches to Web App and reveals sidebar
    await tabApp.click();
    await expect(tabApp).toHaveAttribute('aria-selected', 'true');
    await expect(tabMain).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();

    // 3. Click Main / Showcase tab: returns to full-width showcase and hides sidebar
    await tabMain.click();
    await expect(tabMain).toHaveAttribute('aria-selected', 'true');
    await expect(tabApp).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('nav-dashboard')).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Master the Linux Terminal/i })
    ).toBeVisible();
  });

  test('starts training directly from hero CTA', async ({ page }) => {
    await page.goto('/');

    // Click "Start Training Sandbox"
    const startTrainingBtn = page.getByRole('button', { name: /Start Training Sandbox/i });
    await expect(startTrainingBtn).toBeVisible();
    await startTrainingBtn.click();

    // Verify Training Workspace is active (Lab 001)
    await expect(page.getByRole('heading', { name: /Where Am I\?/i })).toBeVisible();
    await expect(page.locator('.terminal-host')).toBeVisible();
  });
});
