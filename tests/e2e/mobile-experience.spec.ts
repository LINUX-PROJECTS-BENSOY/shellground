import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Experience', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('provides responsive mobile drawer, tab switcher, and touch toolbar', async ({ page }) => {
    await page.goto('/');

    // 1. Verify mobile header: hamburger menu is visible
    const menuBtn = page.getByRole('button', { name: /Open menu/i });
    await expect(menuBtn).toBeVisible();

    // 2. Open mobile drawer navigation
    await menuBtn.click();
    const trainingNavBtn = page.getByTestId('mobile-nav-training');
    await expect(trainingNavBtn).toBeVisible();

    // 3. Navigate to Training Range
    await trainingNavBtn.click();
    await expect(trainingNavBtn).not.toBeVisible(); // Drawer closed

    // 4. Verify Mobile Tab Switcher is visible
    const terminalTab = page.getByRole('button', { name: /Terminal/i });
    const missionTab = page.getByRole('button', { name: /Mission & Tasks/i });
    await expect(terminalTab).toBeVisible();
    await expect(missionTab).toBeVisible();

    // 5. Verify Terminal & Touch Accessory Bar are visible
    const terminalHost = page.locator('.terminal-host');
    await expect(terminalHost).toBeVisible();

    const touchBar = page.locator('.terminal-touch-bar');
    await expect(touchBar).toBeVisible();

    // Check quick action keys on the touch bar
    const tabKey = page.getByRole('button', { name: /Autocomplete/i });
    const ctrlCKey = page.getByRole('button', { name: /Interrupt \/ Cancel/i });
    const pwdKey = page.getByRole('button', { name: /Print working directory/i });
    await expect(tabKey).toBeVisible();
    await expect(ctrlCKey).toBeVisible();
    await expect(pwdKey).toBeVisible();

    // 6. Tap 'pwd' on the touch bar and verify terminal executes it
    await page.waitForTimeout(500);
    await pwdKey.click();

    await expect.poll(async () => {
      return await page.evaluate(() => {
        const host = document.querySelector('.terminal-host') as (Element & { __terminalController?: { getBufferText?: () => string } }) | null;
        return host?.__terminalController?.getBufferText?.() ?? '';
      });
    }, { timeout: 10000 }).toContain('/workspace');

    // 7. Switch to Mission & Tasks tab
    await missionTab.click();
    await expect(page.getByText(/Determine your current working directory/i)).toBeVisible();
    const backBtn = page.getByRole('button', { name: /Back to Terminal/i });
    await expect(backBtn).toBeVisible();

    // 8. Tap "Back to Terminal"
    await backBtn.click();
    await expect(terminalHost).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'scratch/screenshot-mobile-verified.png' });
  });
});

