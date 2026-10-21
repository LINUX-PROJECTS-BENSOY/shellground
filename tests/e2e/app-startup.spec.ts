import { test, expect } from '@playwright/test';

test.describe('Sub-Phase 12.1: Application Startup & Capability Gate', () => {
  test('loads SHELLGROUND and renders header, brand, and security badges', async ({ page }) => {
    // Navigate to root
    await page.goto('/');

    // Verify document title
    await expect(page).toHaveTitle(/SHELLGROUND — Linux Command Training/);

    // Verify brand link in header
    const brand = page.getByRole('button', { name: />_ SHELLGROUND/i });
    await expect(brand).toBeVisible();

    // Verify security & network isolation badges
    await expect(page.getByText('Network: Disabled')).toBeVisible();
    await expect(page.getByText('Sandbox: WASIX')).toBeVisible();

    // Verify Top-Level Tabs
    await expect(page.getByTestId('tab-main')).toBeVisible();
    await expect(page.getByTestId('tab-app')).toBeVisible();

    // Verify Main Showcase Tab headline
    await expect(
      page.getByRole('heading', { name: /Master the Linux Terminal/i })
    ).toBeVisible();

    // Switch to Web App tab (which opens the sidebar and workspace)
    await page.getByTestId('tab-app').click();

    // Navigate to Dashboard
    await page.getByTestId('nav-dashboard').click();

    // Verify Dashboard heading
    await expect(
      page.getByRole('heading', { name: /Terminal Readiness & Training Dashboard/i })
    ).toBeVisible();

    // Verify curriculum progress card
    await expect(page.getByText(/Curriculum Track/i)).toBeVisible();
    await expect(page.getByText(/Linux Foundations/i).first()).toBeVisible();
  });

  test('navigates seamlessly across primary views via sidebar', async ({ page }) => {
    await page.goto('/');

    // Switch to ShellGround Web App tab to access the workspace sidebar
    await page.getByTestId('tab-app').click();

    // Navigate to Lab Catalog
    await page.getByTestId('nav-catalog').click();
    await expect(page.getByRole('heading', { name: /Linux Foundations Curriculum Catalog/i })).toBeVisible();

    // Navigate to Concept Mastery
    await page.getByTestId('nav-mastery').click();
    await expect(page.getByRole('heading', { name: /Concept Mastery & Skill Analytics/i })).toBeVisible();

    // Navigate to Diagnostics
    await page.getByTestId('nav-diagnostics').click();
    await expect(page.getByRole('heading', { name: /Command Fidelity & Execution Diagnostics/i })).toBeVisible();

    // Navigate to Settings
    await page.getByTestId('nav-settings').click();
    await expect(page.getByRole('heading', { name: /System Settings & Local Persistence/i })).toBeVisible();

    // Return to Dashboard
    await page.getByTestId('nav-dashboard').click();
    await expect(
      page.getByRole('heading', { name: /Terminal Readiness & Training Dashboard/i })
    ).toBeVisible();
  });

  test('provides full cyber interactivity: CRT toggle, sound toggle, theme switch, and 3D Command Dock', async ({ page }) => {
    await page.goto('/');

    // Switch to Web App tab
    await page.getByTestId('tab-app').click();

    // 1. Verify CRT toggle button
    const crtBtn = page.getByRole('button', { name: /CRT/i });
    await expect(crtBtn).toBeVisible();
    await crtBtn.click();
    await expect(page.locator('.app-root')).toHaveClass(/crt-active/);

    // 2. Verify Sound FX toggle button
    const soundBtn = page.getByRole('button', { name: /FX|Sound/i });
    await expect(soundBtn).toBeVisible();
    await soundBtn.click();
    await expect(page.getByRole('button', { name: /Sound: ON|FX/i })).toBeVisible();

    // 3. Verify Theme Switcher
    const themeBtn = page.getByRole('button', { name: /cyan|matrix|synthwave|amber/i });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // 4. Navigate to Playground & verify 3D Command Dock
    await page.getByTestId('nav-playground').click();
    const commandDockBtn = page.getByRole('button', { name: /Open 3D Holographic Command Dock/i });
    await expect(commandDockBtn).toBeVisible();
    await commandDockBtn.click();

    // Verify 3D Command Dock dialog
    await expect(page.getByRole('dialog', { name: /3D Holographic Command Dock/i })).toBeVisible();
    await expect(page.getByText('One-click injection into active WASIX terminal')).toBeVisible();

    // Filter commands by search input
    const searchInput = page.getByPlaceholder(/Search commands/i);
    await searchInput.fill('chmod');
    await expect(page.getByText('chmod 755 script.sh')).toBeVisible();

    // Close dock
    await commandDockBtn.click();
    await expect(page.getByRole('dialog', { name: /3D Holographic Command Dock/i })).not.toBeVisible();
  });
});
