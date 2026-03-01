import os
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright, expect

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

def run_test():
    server_ready = threading.Event()
    server_port = [0]

    def start_server():
        with socketserver.TCPServer(("", 0), Handler) as httpd:
            server_port[0] = httpd.server_address[1]
            server_ready.set()
            httpd.serve_forever()

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    server_ready.wait()

    port = server_port[0]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the full version
        page.goto(f"http://localhost:{port}/full/index.html")

        # Trigger the modal
        page.evaluate("startChaosRitual('error')")

        # Wait for the modal to be visible
        modal = page.locator("#custom-modal")
        expect(modal).to_be_visible()

        # Check ARIA attributes on the modal
        expect(modal).to_have_attribute("role", "dialog")
        expect(modal).to_have_attribute("aria-modal", "true")
        expect(modal).to_have_attribute("aria-hidden", "false")

        # Check focus is on the close button
        close_btn = modal.locator(".cta-button")
        expect(close_btn).to_be_focused()

        # Take a screenshot
        page.screenshot(path="verification/modal_focus.png")

        # Close modal to check if focus is restored
        # Wait, if we triggered it via JS, what was the active element? Body probably.
        # Let's test focus restore by focusing a button first.
        page.evaluate("hideCustomAlert()") # Hide the current one

        # Focus a specific button
        nav_btn = page.locator("#nav-btn-0")
        nav_btn.focus()
        expect(nav_btn).to_be_focused()

        # Trigger modal again
        page.evaluate("showCustomAlert('Test', 'Test Title')")
        expect(modal).to_be_visible()
        expect(close_btn).to_be_focused()

        # Close modal using keyboard Enter on the focused close button
        page.keyboard.press("Enter")
        expect(modal).not_to_be_visible()
        expect(modal).to_have_attribute("aria-hidden", "true")

        # Verify focus is restored
        expect(nav_btn).to_be_focused()

        print("Verification completed successfully!")
        browser.close()

if __name__ == "__main__":
    run_test()
