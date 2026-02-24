import time
import subprocess
import sys
from playwright.sync_api import sync_playwright

def run_verification():
    # Start the server
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)  # Wait for server to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Go to the demo page
            page.goto("http://localhost:8000/demo/index.html")

            # Initialize game in FULL mode to bypass paywall
            print("Initializing game in FULL mode...")
            page.evaluate("window.initGame('full')")

            # Navigate to Level 2
            print("Navigating to Level 2...")
            page.click("text=¡Vámonos pal Nivel 2 (SRAP)! 🚀")

            # Wait for level 2 to be visible
            page.wait_for_selector("#level-2", state="visible")

            # Click the first step
            print("Clicking first SRAP step...")
            step_scan = page.locator("#srap-scan")
            step_scan.click()

            # Dismiss modal
            print("Dismissing modal...")
            page.click("text=Entendido, Carnal")

            # Verify class update
            assert "srap-active" in step_scan.get_attribute("class")

            # Take screenshot
            screenshot_path = "/home/jules/verification/srap_active.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

            browser.close()
    except Exception as e:
        print(f"Verification FAILED: {e}")
        sys.exit(1)
    finally:
        server.terminate()

if __name__ == "__main__":
    run_verification()
