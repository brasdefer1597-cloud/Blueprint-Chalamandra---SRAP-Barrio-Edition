import http.server
import socketserver
import threading
from playwright.sync_api import sync_playwright, expect
import os

# Start a simple HTTP server in a separate thread
PORT = 0  # Let the OS pick a free port

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress logging

def start_server():
    with socketserver.TCPServer(("", 0), Handler) as httpd:
        global PORT
        PORT = httpd.server_address[1]
        print(f"Serving on port {PORT}")
        httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Wait a moment for the server to start and assign a port
import time
time.sleep(1)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        url = f"http://localhost:{PORT}/demo/index.html"
        print(f"Navigating to {url}")
        page.goto(url)

        # Verify Home Button
        home_btn = page.locator("#nav-btn-0")
        expect(home_btn).to_have_attribute("aria-label", "Nivel 0: Blueprint Chalamandra")
        expect(home_btn).to_have_attribute("title", "Nivel 0: Blueprint Chalamandra")
        expect(home_btn).to_have_attribute("aria-current", "step") # Default active
        print("✅ Home button verification passed")

        # Verify Level 2 Button
        lvl2_btn = page.locator("#nav-btn-2")
        expect(lvl2_btn).to_have_attribute("aria-label", "Nivel 2: SRAP Flow Premium")
        expect(lvl2_btn).to_have_attribute("title", "Nivel 2: SRAP Flow Premium")
        expect(lvl2_btn).to_have_attribute("aria-disabled", "true") # Locked by default
        print("✅ Level 2 button verification passed")

        # Hover over level 2 button to show tooltip (visual check, though tooltip native behavior might not capture well in screenshot without specialized tools, but we can try)
        lvl2_btn.hover()

        # Take a screenshot
        screenshot_path = "verification/nav_verification.png"
        page.screenshot(path=screenshot_path)
        print(f"✅ Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
