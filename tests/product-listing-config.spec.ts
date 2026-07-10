import { test, expect } from '@playwright/test';

const E2E_BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5177';
const E2E_API_URL = process.env.E2E_API_URL || 'http://localhost:5001/api';

/**
 * Test: Product Listing Page Title and Description from MongoDB
 * 
 * This test verifies that the Product Listing Page displays
 * the title and description fetched from the MongoDB siteconfig.
 */
test.describe('Product Listing Page - Dynamic Content', () => {
  
  test('should display title and description from MongoDB siteconfig', async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      if (msg.text().includes('ProductListingPage')) {
        console.log('BROWSER LOG:', msg.text());
      }
    });
    
    // Navigate to the product listing page (shop)
    await page.goto(`${E2E_BASE_URL}/shop`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for React to render
    await page.waitForTimeout(2000);
     
    // Check the page title - should be "Premium Dry Fruits & Nuts" from MongoDB
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible();
    
    // Get the actual title text
    const titleText = await pageTitle.textContent();
    console.log('Page Title:', titleText);
    
    // Verify it's NOT the hardcoded fallback "Latest Electronics"
    expect(titleText).not.toBe('Latest Electronics');
    
    // Verify it contains expected content from MongoDB
    // Based on the MongoDB data: "Premium Dry Fruits & Nuts"
    expect(titleText).toContain('Premium');
    
    // Check description text
    const descriptionLocator = page.locator('p.text-gray-600');
    await expect(descriptionLocator.first()).toBeVisible();
    
    const descriptionText = await descriptionLocator.first().textContent();
    console.log('Page Description:', descriptionText);
    
    // Verify it's NOT the hardcoded fallback
    expect(descriptionText).not.toContain('cutting-edge technology');
    expect(descriptionText).not.toContain('electronics');
    
    // Should contain content from MongoDB
    expect(descriptionText?.toLowerCase()).toContain('dry fruits');
  });

  test('should fetch siteconfig API and return productPages', async ({ request }) => {
    // Directly test the API endpoint
    const response = await request.get(`${E2E_API_URL}/siteconfig`);
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('API Response - productPages:', JSON.stringify(data.data?.productPages, null, 2));
    
    // Verify productPages exists
    expect(data.data).toHaveProperty('productPages');
    expect(data.data.productPages).toHaveProperty('listing');
    expect(data.data.productPages.listing).toHaveProperty('title');
    expect(data.data.productPages.listing).toHaveProperty('description');
    
    // Verify actual values from MongoDB
    expect(data.data.productPages.listing.title).toBe('Premium Dry Fruits & Nuts');
  });

  test('admin can update product page title and it reflects on frontend', async ({ page, request }) => {
    const newTitle = 'Test Title ' + Date.now();
    const newDescription = 'Test Description for automated testing';
    
    // Step 1: Update via API (simulating admin dashboard save)
    // First get current config
    const getResponse = await request.get(`${E2E_API_URL}/siteconfig/all`);
    const currentConfig = await getResponse.json();
    
    // Update productPages
    const updatedConfig = {
      ...currentConfig.data,
      productPages: {
        listing: {
          title: newTitle,
          description: newDescription
        }
      }
    };
    
    // Save updated config
    const putResponse = await request.put(`${E2E_API_URL}/siteconfig/all`, {
      data: {
        config: updatedConfig
      }
    });
    
    expect(putResponse.ok()).toBeTruthy();
    
    // Step 2: Verify frontend displays updated content
    await page.goto(`${E2E_BASE_URL}/shop`);
    await page.waitForLoadState('networkidle');
    
    // Force reload to clear any cache
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText(newTitle);
    
    // Step 3: Restore original title
    const restoreConfig = {
      ...currentConfig.data,
      productPages: {
        listing: {
          title: 'Premium Dry Fruits & Nuts',
          description: 'Discover our handpicked selection of the finest almonds, cashews, walnuts, pistachios, and exotic dried fruits - sourced directly from trusted farmers worldwide'
        }
      }
    };
    
    await request.put(`${E2E_API_URL}/siteconfig/all`, {
      data: {
        config: restoreConfig
      }
    });
    
    console.log('Test completed - title was dynamically updated and verified');
  });
});
