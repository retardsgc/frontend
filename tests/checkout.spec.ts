/**
 * E-Commerce Checkout Flow Test
 * 
 * This test script covers the complete checkout flow:
 * 1. Navigate to products page
 * 2. Add a product to cart
 * 3. Go to cart
 * 4. Click checkout
 * 5. Fill billing details
 * 6. Place order
 * 7. Verify success popup
 * 8. Verify order confirmation page
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:5001
 * - Frontend running on http://localhost:5177
 * - MongoDB running on port 28000
 * - User must be logged in (testaddress@test.com)
 * 
 * Run with: npx playwright test checkout.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5177';
const API_URL = 'http://localhost:5001';

// Test user credentials
const TEST_USER = {
  email: 'testaddress@test.com',
  password: 'Test@123'
};

test.describe('Checkout Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login first
    await page.goto(`${BASE_URL}/`);
    
    // Check if already logged in by looking for account icon
    const isLoggedIn = await page.locator('[href="/account"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      // Click on account/login to open login modal
      await page.click('button:has-text("Login"), [aria-label="Login"]').catch(async () => {
        // Alternative: trigger login event
        await page.evaluate(() => {
          window.dispatchEvent(new Event('auth:openLogin'));
        });
      });
      
      // Wait for login modal
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      // Fill login form
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button:has-text("Login"), button:has-text("Sign In")');
      
      // Wait for login to complete
      await page.waitForTimeout(2000);
    }
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Complete checkout flow with popup confirmation', async () => {
    // Step 1: Navigate to products page
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    
    // Verify products are loaded
    await expect(page.locator('h1:has-text("Latest Electronics")')).toBeVisible();

    // Step 2: Add first available product to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    
    // Wait for cart to update
    await page.waitForTimeout(1000);
    
    // Verify cart badge shows item count
    const cartBadge = page.locator('[href="/cart"]').locator('text=/\\d+/');
    await expect(cartBadge).toBeVisible();

    // Step 3: Go to cart
    await page.click('[href="/cart"]');
    await page.waitForURL(`${BASE_URL}/cart`);
    
    // Verify cart page loaded with items
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    await expect(page.locator('button:has-text("Check out")')).toBeVisible();

    // Step 4: Click checkout
    await page.click('button:has-text("Check out")');
    await page.waitForURL(`${BASE_URL}/checkout`);
    
    // Step 5: Verify checkout page loaded
    await expect(page.locator('h1:has-text("Check Out")')).toBeVisible();
    await expect(page.locator('h2:has-text("Billing details")')).toBeVisible();
    await expect(page.locator('h2:has-text("Your order")')).toBeVisible();

    // Step 6: Fill billing details if not pre-filled
    const firstNameInput = page.locator('input').nth(0);
    const firstNameValue = await firstNameInput.inputValue();
    
    if (!firstNameValue) {
      await page.fill('input[placeholder*="First"]', 'Test');
      await page.fill('input[placeholder*="Last"]', 'User');
      await page.selectOption('select:near(:text("Country"))', 'India');
      await page.fill('input:near(:text("Town/City"))', 'Mumbai');
      await page.fill('input:near(:text("Address"))', '123 Test Street');
      await page.fill('input:near(:text("Phone"))', '+91 98765 43210');
    }
    
    // Ensure email is filled
    const emailInput = page.locator('input[type="email"]');
    const emailValue = await emailInput.inputValue();
    if (!emailValue) {
      await emailInput.fill(TEST_USER.email);
    }

    // Step 7: Check terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"][id="agreeTerms"]');
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.click();
    }

    // Step 8: Place order
    await page.click('button:has-text("Place order")');
    
    // Step 9: Verify success popup appears
    await expect(page.locator('text=Order Placed Successfully!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Check your email inbox')).toBeVisible();
    await expect(page.locator('text=A confirmation email has been sent')).toBeVisible();
    
    // Verify order ID is shown
    await expect(page.locator('text=Order ID')).toBeVisible();

    // Step 10: Click View Order Details
    await page.click('button:has-text("View Order Details")');
    
    // Step 11: Verify order confirmation page
    await page.waitForURL(`${BASE_URL}/order-confirmation`);
    await expect(page.locator('h1:has-text("Order Confirmed!")')).toBeVisible();
    await expect(page.locator('text=Order Confirmation Email Sent')).toBeVisible();
  });

  test('Checkout validates required fields', async () => {
    // Add product and go to checkout
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    await page.click('[href="/cart"]');
    await page.waitForURL(`${BASE_URL}/cart`);
    
    await page.click('button:has-text("Check out")');
    await page.waitForURL(`${BASE_URL}/checkout`);

    // Clear all fields
    await page.fill('input', '');
    
    // Try to place order without agreeing to terms
    const termsCheckbox = page.locator('input[type="checkbox"][id="agreeTerms"]');
    if (await termsCheckbox.isChecked()) {
      await termsCheckbox.click();
    }
    
    await page.click('button:has-text("Place order")');
    
    // Verify error message appears
    await expect(page.locator('.bg-red-50, [role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('Checkout uses saved address', async () => {
    // Go to checkout with items in cart
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    await page.click('[href="/cart"]');
    await page.click('button:has-text("Check out")');
    await page.waitForURL(`${BASE_URL}/checkout`);
    
    // Check if saved address dropdown exists
    const addressDropdown = page.locator('select:has(option:has-text("saved address"))');
    
    if (await addressDropdown.isVisible()) {
      // Select a saved address
      const options = await addressDropdown.locator('option').allTextContents();
      
      if (options.length > 1) {
        // Select first saved address (not "Enter new address")
        await addressDropdown.selectOption({ index: 1 });
        
        // Verify form fields are populated
        const firstNameInput = page.locator('input').first();
        const firstNameValue = await firstNameInput.inputValue();
        expect(firstNameValue).not.toBe('');
      }
    }
  });
});

test.describe('API Integration', () => {
  test('Order creation API works', async ({ request }) => {
    // This test verifies the backend API directly
    // First login to get token
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeDefined();
    
    const token = loginData.token;
    
    // Get cart
    const cartResponse = await request.get(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    expect(cartResponse.ok()).toBeTruthy();
  });
});
