import sys
import subprocess
import time
import os
from playwright.sync_api import sync_playwright

def run_test():
    # Start the server
    # Use python3 explicitely and ignore output to keep clean
    server = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)  # Give server time to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Navigate to the demo page
            page.goto("http://localhost:8000/demo/index.html")

            # Wait for JS to load
            page.wait_for_load_state("networkidle")

            # Verify initial state: Level 0 visible, Level 2 hidden
            # Level 0 should NOT have 'hidden' class. Level 2 should have 'hidden' class.
            level0_hidden = page.evaluate("document.getElementById('level-0').classList.contains('hidden')")
            level2_hidden = page.evaluate("document.getElementById('level-2').classList.contains('hidden')")

            print(f"Initial State: Level 0 hidden: {level0_hidden}, Level 2 hidden: {level2_hidden}")

            if level0_hidden or not level2_hidden:
                print("FAIL: Initial state incorrect.")
                return False

            # Simulate unlocking and rendering Level 2
            print("Action: Unlocking and rendering Level 2 via JS execution...")
            page.evaluate("unlockAndRenderLevel(2)")

            # Wait a bit for potential transitions/updates
            time.sleep(0.5)

            # Verify new state: Level 0 hidden, Level 2 visible
            level0_hidden = page.evaluate("document.getElementById('level-0').classList.contains('hidden')")
            level2_hidden = page.evaluate("document.getElementById('level-2').classList.contains('hidden')")

            print(f"New State (Level 2): Level 0 hidden: {level0_hidden}, Level 2 hidden: {level2_hidden}")

            if not level0_hidden or level2_hidden:
                print("FAIL: Level 2 failed to render or Level 0 failed to hide.")
                return False

            # Simulate clicking Nav Button 0 (HOME)
            print("Action: Clicking Home Button...")
            # Ensure click triggers JS
            page.click("#nav-btn-0")

            time.sleep(0.5)

            # Verify back to Level 0
            level0_hidden = page.evaluate("document.getElementById('level-0').classList.contains('hidden')")
            level2_hidden = page.evaluate("document.getElementById('level-2').classList.contains('hidden')")

            print(f"Final State (Level 0): Level 0 hidden: {level0_hidden}, Level 2 hidden: {level2_hidden}")

            if level0_hidden or not level2_hidden:
                print("FAIL: Failed to return to Level 0.")
                return False

            print("PASS: Navigation logic verified.")
            return True

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        server.terminate()

if __name__ == "__main__":
    if run_test():
        sys.exit(0)
    else:
        sys.exit(1)
