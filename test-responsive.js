import { chromium } from 'playwright';

async function testResponsiveness() {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  // Set auth token
  await context.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    }));
  });

  try {
    // Test Mobile View (375px)
    console.log('Testing Mobile View (375px)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5177/account');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/screenshots/account-mobile-accordion.png',
      fullPage: true 
    });
    console.log('✓ Mobile accordion screenshot saved');

    // Navigate to orders on mobile
    const accordion = page.locator('[data-testid="accordion-orders"]').first();
    await accordion.click();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/screenshots/account-mobile-orders-cards.png',
      fullPage: true 
    });
    console.log('✓ Mobile orders cards screenshot saved');

    // Test Tablet View (768px)
    console.log('\nTesting Tablet View (768px)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5177/account');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/screenshots/account-tablet.png',
      fullPage: true 
    });
    console.log('✓ Tablet screenshot saved');

    // Test Desktop View (1280px)
    console.log('\nTesting Desktop View (1280px)...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5177/account');
    await page.waitForLoadState('networkidle');
    
    // Go to orders on desktop
    const ordersLink = page.locator('[data-testid="sidebar-orders"]');
    await ordersLink.click();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'test-results/screenshots/account-desktop-orders-cards.png',
      fullPage: true 
    });
    console.log('✓ Desktop orders cards screenshot saved');

    // Test no horizontal overflow on mobile
    console.log('\nChecking for horizontal overflow...');
    await page.setViewportSize({ width: 375, height: 812 });
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (!hasOverflow) {
      console.log('✓ No horizontal overflow on mobile');
    } else {
      console.log('✗ Horizontal overflow detected on mobile');
    }

    console.log('\n✅ All responsive screenshots generated successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testResponsiveness();
