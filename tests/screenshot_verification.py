import subprocess
import time
import sys
import os
from playwright.sync_api import sync_playwright

def run_test():
    server_process = subprocess.Popen([sys.executable, "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Server started on port 8000")
    time.sleep(2) # Wait for server

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            url = "http://localhost:8000/demo/index.html"
            print(f"Navigating to {url}")
            page.goto(url)

            # 1. Unlock Level 2
            print("Unlocking Level 2...")
            # Wait for Level 0 button
            button = page.locator("#level-0 button.cta-button")
            button.wait_for(state="visible")
            button.click()

            # Wait for Level 2 to be visible
            level2 = page.locator("#level-2")
            level2.wait_for(state="visible")
            print("Level 2 visible.")

            # 2. Interact with SRAP Step
            step = page.locator("#srap-scan")
            step.wait_for(state="visible")

            print("Clicking step #srap-scan...")
            step.click()

            # Wait for UI update (modal might appear too)
            page.wait_for_timeout(1000)

            # Take screenshot
            screenshot_path = "tests/verification.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

            browser.close()

    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)
    finally:
        server_process.terminate()
        server_process.wait()
        print("Server stopped")

if __name__ == "__main__":
    run_test()
