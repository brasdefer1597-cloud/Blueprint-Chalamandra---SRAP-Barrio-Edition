from playwright.sync_api import sync_playwright
import threading
import http.server
import socketserver
import os

PORT = 0

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

def run_server(server_ready_event, port_list):
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        port_list.append(httpd.server_address[1])
        server_ready_event.set()
        httpd.serve_forever()

def verify():
    server_ready_event = threading.Event()
    port_list = []
    server_thread = threading.Thread(target=run_server, args=(server_ready_event, port_list))
    server_thread.daemon = True
    server_thread.start()

    server_ready_event.wait()
    port = port_list[0]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to demo page
        page.goto(f"http://localhost:{port}/demo/index.html")

        # Try to navigate to level 3 to trigger the paywall modal
        page.evaluate("window.renderLevel(3)")

        # Wait for modal to be visible
        page.wait_for_selector("#custom-modal.flex")

        # Check that the CTA button has the correct attributes
        link = page.locator("#modal-message a.cta-button")

        # Assert attributes
        assert link.get_attribute("target") == "_blank", "Missing target='_blank'"
        assert link.get_attribute("rel") == "noopener noreferrer", "Missing rel='noopener noreferrer'"

        # Take screenshot
        os.makedirs("/home/jules/verification", exist_ok=True)
        screenshot_path = "/home/jules/verification/paywall_modal.png"
        page.screenshot(path=screenshot_path)

        print(f"Verification successful! Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify()
