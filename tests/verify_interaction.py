import time
import subprocess
import sys
from playwright.sync_api import sync_playwright

def run_test():
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

            # Verify initial state
            print("Verifying initial state...")
            assert page.is_visible("#level-0")
            insight_counter = page.locator("#insight-counter")
            assert insight_counter.inner_text() == "0"

            # Navigate to Level 2
            print("Navigating to Level 2...")
            page.click("text=¡Vámonos pal Nivel 2 (SRAP)! 🚀")

            # Wait for level 2 to be visible
            page.wait_for_selector("#level-2", state="visible")
            assert not page.is_visible("#level-0")

            # Click the first step
            print("Clicking first SRAP step...")
            step_scan = page.locator("#srap-scan")
            step_scan.click()

            # This shows a modal: "SRAP Dominado"
            print("Dismissing modal...")
            page.click("text=Entendido, Carnal")

            # Verify score update (1 point)
            assert insight_counter.inner_text() == "1"

            # Verify class update
            assert "srap-active" in step_scan.get_attribute("class")

            # Verify duplicate click
            print("Clicking same step again...")
            step_scan.click()

            # This shows a modal: "Paso Completo" (already done)
            print("Dismissing modal again...")
            page.click("text=Entendido, Carnal")

            # Verify score didn't increase
            assert insight_counter.inner_text() == "1"

            # Navigate to Level 3
            print("Navigating to Level 3...")
            page.click("text=¡Nivel 3: Caos Controlado! 🌪")
            page.wait_for_selector("#level-3", state="visible")

            # Unlock level 5 directly
            print("Navigating to Level 5...")
            page.click("text=¡Nivel 5: Mandala Multiconsciente! 🎩")
            page.wait_for_selector("#level-5", state="visible")

            # Click a hat
            print("Clicking a Hat...")
            hat_creativo = page.locator("#hat-creativo")
            hat_creativo.click()

            # This shows a modal: "Mandala Activo"
            print("Dismissing modal...")
            page.click("text=Entendido, Carnal")

            # Check if score increased by 3 (from 1 to 4)
            assert insight_counter.inner_text() == "4"
            assert "hat-revealed" in hat_creativo.get_attribute("class")

            print("Test PASSED!")

            browser.close()
    except Exception as e:
        print(f"Test FAILED: {e}")
        sys.exit(1)
    finally:
        server.terminate()

if __name__ == "__main__":
    run_test()
