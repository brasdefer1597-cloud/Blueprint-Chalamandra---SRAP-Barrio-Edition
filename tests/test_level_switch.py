
import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

server_ready = threading.Event()
ACTUAL_PORT = 0

def start_server():
    global ACTUAL_PORT
    # Serve the current directory
    os.chdir(os.getcwd())
    handler = http.server.SimpleHTTPRequestHandler
    # Bind to port 0 to let OS pick a free port
    with socketserver.TCPServer(("", 0), handler) as httpd:
        ACTUAL_PORT = httpd.server_address[1]
        print(f"Server started on port {ACTUAL_PORT}")
        server_ready.set()
        httpd.serve_forever()

def verify_level_switching():
    # Start server in a thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to be ready
    if not server_ready.wait(timeout=5):
        raise Exception("Server failed to start")

    SERVER_URL = f"http://localhost:{ACTUAL_PORT}"
    print(f"Testing against {SERVER_URL}")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print(f"Navigating to {SERVER_URL}/demo/index.html")
        page.goto(f"{SERVER_URL}/demo/index.html")

        # Wait for level-0 to be visible
        page.wait_for_selector("#level-0", state="visible", timeout=5000)

        # Check initial state: Level 0 visible
        assert page.is_visible("#level-0"), "Level 0 should be visible initially"
        assert not page.is_visible("#level-2"), "Level 2 should be hidden initially"

        print("✅ Initial state verified.")

        # Click CTA button to unlock Level 2
        cta_button = page.locator("#level-0 button.cta-button")
        cta_button.click()

        # Wait for Level 2 to be visible
        page.wait_for_selector("#level-2", state="visible", timeout=5000)

        # Now Level 2 should be visible
        assert not page.is_visible("#level-0"), "Level 0 should be hidden after switching"
        assert page.is_visible("#level-2"), "Level 2 should be visible after switching"

        print("✅ Switch to Level 2 verified.")

        # Now verify going back to Level 0 via nav button
        nav_btn = page.locator("#nav-btn-0")
        nav_btn.click()

        # Wait for Level 0 to be visible
        page.wait_for_selector("#level-0", state="visible", timeout=5000)

        assert page.is_visible("#level-0"), "Level 0 should be visible after navigating back"
        assert not page.is_visible("#level-2"), "Level 2 should be hidden after navigating back"

        print("✅ Switch back to Level 0 verified.")

        browser.close()

if __name__ == "__main__":
    try:
        verify_level_switching()
        print("✅ Verification Passed")
    except Exception as e:
        print(f"❌ Verification Failed: {e}")
        exit(1)
