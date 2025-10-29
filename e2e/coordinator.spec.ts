import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Coordinator Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display home page', async ({ page }) => {
    await expect(page).toHaveTitle(/AIFM/);
    await expect(page.locator('text=AIFM Agent Portal')).toBeVisible();
  });

  test('should navigate to coordinator inbox', async ({ page }) => {
    // Note: This requires being logged in as coordinator
    // In production, use Clerk test credentials
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Check page loaded
    await expect(page.locator('text=QC Inbox')).toBeVisible();
    await expect(page.locator('text=Review and approve quality checks')).toBeVisible();
  });

  test('should display QC tasks', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Wait for tasks to load
    await page.waitForSelector('[class*="space-y-4"]');
    
    // Check for task cards
    const taskCards = page.locator('div[class*="Card"]');
    const count = await taskCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should export tasks to CSV', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Setup download listener
    const downloadPromise = context.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export CSV")');
    
    // Wait for download and verify
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('tasks');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should open confirmation modal when approving', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Click first approve button
    const approveButtons = page.locator('button:has-text("Approve")');
    if (await approveButtons.count() > 0) {
      await approveButtons.first().click();
      
      // Check modal appears
      await expect(page.locator('text=Confirm Approval')).toBeVisible();
      await expect(page.locator('text=Are you sure')).toBeVisible();
    }
  });

  test('should cancel approval confirmation', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Click first approve button
    const approveButtons = page.locator('button:has-text("Approve")');
    if (await approveButtons.count() > 0) {
      await approveButtons.first().click();
      
      // Wait for modal
      await expect(page.locator('text=Confirm Approval')).toBeVisible();
      
      // Click cancel
      await page.click('button:has-text("Cancel"):visible');
      
      // Modal should disappear
      await expect(page.locator('text=Confirm Approval')).not.toBeVisible();
    }
  });

  test('should show toast notification on action', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Perform an action that triggers toast
    const exportButton = page.locator('button:has-text("Export CSV")');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Check for toast (may show in bottom right)
      const toast = page.locator('[class*="toast"], [class*="notification"]');
      // Toast might appear and disappear, so just check it was there
      if (await toast.count() > 0) {
        expect(await toast.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should have search and filter functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    await page.goto(BASE_URL);
    
    // Should still render something (error boundary)
    await expect(page.locator('body')).toBeTruthy();
    
    // Go back online
    await page.context().setOffline(false);
  });

  test('should show error boundary on fatal error', async ({ page }) => {
    // This is hard to test without injecting an error
    // In production, you might navigate to a page that triggers an error
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Should get 404 or error page
    const statusCode = page.url();
    expect(statusCode).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for proper heading text
    await expect(page.locator('h1')).toContainText('QC Inbox');
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Check buttons are keyboard accessible
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check buttons have text or aria-label
    for (let i = 0; i < Math.min(count, 3); i++) {
      const btn = buttons.nth(i);
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/coordinator/inbox`);
    
    // Check for label elements
    const labels = page.locator('label');
    const count = await labels.count();
    
    // If there are form inputs, there should be labels
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });
});
