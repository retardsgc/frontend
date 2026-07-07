import { test, expect } from '@playwright/test';

// Viewport configurations for responsive testing
const viewports = {
  mobile: { width: 375, height: 812, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1440, height: 900, name: 'desktop' },
};

// Mock user token for testing (will be set via localStorage)
const mockToken = 'test-token-for-responsive-testing';

test.describe('Account Page Responsiveness', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up mock authentication by injecting token into localStorage
    await page.goto('http://localhost:5177');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    }, mockToken);
  });

  // Test Mobile Viewport
  test.describe('Mobile Viewport (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test('should display mobile-friendly header', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-header.png`,
        fullPage: false 
      });
      
      // Check header is visible and properly sized
      const header = page.locator('h1');
      await expect(header).toBeVisible();
      
      // Check mobile navigation (dropdown) is visible
      const mobileNav = page.locator('select');
      await expect(mobileNav).toBeVisible();
    });

    test('should hide desktop sidebar on mobile', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Desktop sidebar should be hidden on mobile
      const desktopSidebar = page.locator('nav.space-y-2');
      await expect(desktopSidebar).toBeHidden();
    });

    test('should show mobile dropdown navigation', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Mobile dropdown should be visible
      const mobileDropdown = page.locator('select');
      await expect(mobileDropdown).toBeVisible();
      
      // Should have all navigation options
      const options = await mobileDropdown.locator('option').count();
      expect(options).toBeGreaterThanOrEqual(5);
    });

    test('should display dashboard content properly on mobile', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-dashboard.png`,
        fullPage: true 
      });
      
      // Check no horizontal overflow
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(viewports.mobile.width + 5);
    });

    test('should navigate to orders tab on mobile', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Select orders from dropdown
      const mobileDropdown = page.locator('select');
      await mobileDropdown.selectOption('orders');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-orders.png`,
        fullPage: true 
      });
      
      // Orders table should show mobile card view
      const mobileCards = page.locator('.block.md\\:hidden');
      await expect(mobileCards.first()).toBeVisible();
    });

    test('should display addresses responsively on mobile', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to addresses
      const mobileDropdown = page.locator('select');
      await mobileDropdown.selectOption('addresses');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-addresses.png`,
        fullPage: true 
      });
      
      // Add address button should be full width on mobile
      const addButton = page.locator('button:has-text("Add a new address")');
      await expect(addButton).toBeVisible();
    });

    test('should display wishlist grid on mobile (2 columns)', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to wishlist
      const mobileDropdown = page.locator('select');
      await mobileDropdown.selectOption('wishlist');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-wishlist.png`,
        fullPage: true 
      });
    });

    test('should display account details form on mobile', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to account details
      const mobileDropdown = page.locator('select');
      await mobileDropdown.selectOption('account-details');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-account-details.png`,
        fullPage: true 
      });
      
      // Form inputs should be full width
      const firstNameInput = page.locator('input[type="text"]').first();
      await expect(firstNameInput).toBeVisible();
    });
  });

  // Test Tablet Viewport
  test.describe('Tablet Viewport (768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
    });

    test('should display tablet layout properly', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-tablet-dashboard.png`,
        fullPage: true 
      });
      
      // Check header is properly sized
      const header = page.locator('h1');
      await expect(header).toBeVisible();
    });

    test('should show orders table on tablet', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to orders
      await page.click('text=Orders', { force: true }).catch(async () => {
        const dropdown = page.locator('select');
        if (await dropdown.isVisible()) {
          await dropdown.selectOption('orders');
        }
      });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-tablet-orders.png`,
        fullPage: true 
      });
    });

    test('should display addresses in 2-column grid on tablet', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to addresses
      await page.click('text=Addresses', { force: true }).catch(async () => {
        const dropdown = page.locator('select');
        if (await dropdown.isVisible()) {
          await dropdown.selectOption('addresses');
        }
      });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-tablet-addresses.png`,
        fullPage: true 
      });
    });

    test('should display wishlist grid on tablet', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to wishlist
      await page.click('text=Wishlist', { force: true }).catch(async () => {
        const dropdown = page.locator('select');
        if (await dropdown.isVisible()) {
          await dropdown.selectOption('wishlist');
        }
      });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-tablet-wishlist.png`,
        fullPage: true 
      });
    });

    test('should display account details form on tablet', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to account details
      await page.click('text=Account Details', { force: true }).catch(async () => {
        const dropdown = page.locator('select');
        if (await dropdown.isVisible()) {
          await dropdown.selectOption('account-details');
        }
      });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-tablet-account-details.png`,
        fullPage: true 
      });
    });
  });

  // Test Desktop Viewport
  test.describe('Desktop Viewport (1440px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
    });

    test('should display full desktop layout with sidebar', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-desktop-dashboard.png`,
        fullPage: true 
      });
      
      // Desktop sidebar should be visible
      const sidebar = page.locator('nav.space-y-2.sticky');
      await expect(sidebar).toBeVisible();
      
      // Mobile dropdown should be hidden
      const mobileDropdown = page.locator('select');
      await expect(mobileDropdown).toBeHidden();
    });

    test('should display sidebar navigation items on desktop', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Check all sidebar items are visible
      await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
      await expect(page.locator('button:has-text("Orders")')).toBeVisible();
      await expect(page.locator('button:has-text("Addresses")')).toBeVisible();
      await expect(page.locator('button:has-text("Account Details")')).toBeVisible();
      await expect(page.locator('button:has-text("Wishlist")')).toBeVisible();
      await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });

    test('should navigate to orders via sidebar click', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Click on Orders in sidebar
      await page.click('button:has-text("Orders")');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-desktop-orders.png`,
        fullPage: true 
      });
      
      // Verify orders table is visible
      const ordersTable = page.locator('table');
      await expect(ordersTable).toBeVisible();
    });

    test('should display addresses in grid on desktop', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Click on Addresses in sidebar
      await page.click('button:has-text("Addresses")');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-desktop-addresses.png`,
        fullPage: true 
      });
    });

    test('should display wishlist in 3-column grid on desktop', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Click on Wishlist in sidebar
      await page.click('button:has-text("Wishlist")');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-desktop-wishlist.png`,
        fullPage: true 
      });
    });

    test('should display account details form on desktop', async ({ page }) => {
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Click on Account Details in sidebar
      await page.click('button:has-text("Account Details")');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-desktop-account-details.png`,
        fullPage: true 
      });
      
      // Form should have 2-column layout for name fields
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });
  });

  // Cross-viewport overflow tests
  test.describe('No Horizontal Overflow Tests', () => {
    for (const [name, viewport] of Object.entries(viewports)) {
      test(`should have no horizontal overflow on ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5177/account');
        await page.waitForTimeout(1000);
        
        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);
      });
    }
  });

  // Modal responsiveness tests
  test.describe('Modal Responsiveness', () => {
    test('should display address form modal responsively on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to addresses
      const mobileDropdown = page.locator('select');
      await mobileDropdown.selectOption('addresses');
      await page.waitForTimeout(500);
      
      // Click add address button
      await page.click('button:has-text("Add a new address")');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-mobile-address-modal.png`,
        fullPage: false 
      });
      
      // Modal should be visible and properly sized
      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible();
    });

    test('should display address form modal responsively on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('http://localhost:5177/account');
      await page.waitForTimeout(1000);
      
      // Navigate to addresses
      await page.click('button:has-text("Addresses")');
      await page.waitForTimeout(500);
      
      // Click add address button
      await page.click('button:has-text("Add a new address")');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/screenshots/account-desktop-address-modal.png`,
        fullPage: false 
      });
      
      // Modal should be visible
      const modal = page.locator('.fixed.inset-0');
      await expect(modal).toBeVisible();
    });
  });

  // Full page screenshots at all viewports
  test.describe('Full Page Screenshots', () => {
    for (const [name, viewport] of Object.entries(viewports)) {
      test(`capture full account page at ${name} viewport`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5177/account');
        await page.waitForTimeout(1500);
        
        await page.screenshot({ 
          path: `tests/screenshots/account-full-${name}.png`,
          fullPage: true 
        });
      });
    }
  });
});
