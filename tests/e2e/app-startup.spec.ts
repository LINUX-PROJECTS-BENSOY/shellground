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
});
