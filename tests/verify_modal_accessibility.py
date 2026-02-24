import time
from playwright.sync_api import sync_playwright

def verify_modal_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Navigate to the page
        print("Navigating to demo page...")
        page.goto("http://localhost:8000/demo/index.html")

        # 2. Find the Home button (which is enabled) to test focus restoration
        home_btn = page.locator("#nav-btn-0")

        # Focus the button first to simulate user interaction
        print("Focusing Home button...")
        home_btn.focus()

        # 3. Trigger the modal manually via JS to simulate an alert
        print("Triggering modal via JS...")
        page.evaluate('showCustomAlert("Test Message", "Test Title")')

        # 4. Verify modal is visible
        modal = page.locator("#custom-modal")
        if modal.is_visible():
            print("SUCCESS: Modal is visible.")
            # TAKE SCREENSHOT
            page.screenshot(path="verification_modal.png")
            print("Screenshot saved to verification_modal.png")
        else:
            print("FAILURE: Modal is NOT visible.")
            browser.close()
            exit(1)

        # 5. Check Focus Management (Expect focus to be on the close button)
        # Wait a bit for focus transition
        time.sleep(0.5)

        # Get the active element's tag and text
        focused_tag = page.evaluate("document.activeElement.tagName")
        focused_text = page.evaluate("document.activeElement.textContent")
        print(f"Focused element: <{focused_tag}> '{focused_text.strip() if focused_text else ''}'")

        # The close button text is "Entendido, Carnal"
        if focused_tag == "BUTTON" and "Entendido, Carnal" in (focused_text or ""):
            print("SUCCESS: Focus moved to modal close button.")
        else:
            print(f"FAILURE: Focus is on <{focused_tag}>, expected Close Button.")

        # 6. Check ARIA attributes
        role = modal.get_attribute("role")
        aria_modal = modal.get_attribute("aria-modal")
        print(f"Modal Role: {role}, Aria-Modal: {aria_modal}")

        if role == "dialog" and aria_modal == "true":
             print("SUCCESS: ARIA attributes are correct.")
        else:
             print("FAILURE: ARIA attributes missing or incorrect.")

        # 7. Press Escape to close
        print("Pressing Escape...")
        page.keyboard.press("Escape")

        # 8. Verify modal is hidden
        time.sleep(0.5)
        if not modal.is_visible():
            print("SUCCESS: Modal closed on Escape.")
        else:
            print("FAILURE: Modal did NOT close on Escape.")

        # 9. Verify focus restore
        focused_element_id = page.evaluate("document.activeElement.id")
        print(f"Focused element ID after close: '{focused_element_id}'")

        if focused_element_id == "nav-btn-0":
            print("SUCCESS: Focus restored to triggering button.")
        else:
            print(f"FAILURE: Focus is on '{focused_element_id}', expected 'nav-btn-0'.")

        browser.close()

if __name__ == "__main__":
    verify_modal_accessibility()
