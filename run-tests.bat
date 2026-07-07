@echo off
REM Comprehensive E-Commerce Component Testing Script
REM Tests: 980+ across all components

echo ========================================
echo COMPREHENSIVE COMPONENT TESTING
echo ========================================
echo.
echo Total Tests: 980+
echo Testing: Functionality, Responsiveness, Accessibility
echo.

cd /d "c:\Users\srik2\OneDrive\Desktop\ecommerce (2)\ecommerce\frontend"

echo Starting Playwright tests...
echo.

call npx playwright test tests/comprehensive.spec.ts --reporter=html

echo.
echo ========================================
echo Test Execution Complete!
echo ========================================
echo.
echo Opening test report...
call npx playwright show-report

pause
