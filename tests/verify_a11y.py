import asyncio
import http.server
import socketserver
import threading
from playwright.async_api import async_playwright

PORT = 0  # Random port
URL = ""

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server(server_ready_event):
    global URL
    with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
        actual_port = httpd.server_address[1]
        URL = f"http://localhost:{actual_port}/demo/index.html"
        server_ready_event.set()
        httpd.serve_forever()

async def main():
    server_ready = threading.Event()
    server_thread = threading.Thread(target=start_server, args=(server_ready,), daemon=True)
    server_thread.start()
    server_ready.wait()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(URL)

        # 1. Check if focus classes are added to srap-step elements
        await page.click('button:has-text("¡Vámonos pal Nivel 2 (SRAP)!")')
        # Waiting for level 2 to render
        await page.wait_for_selector('#srap-scan')

        # Check classes
        classes = await page.evaluate("document.getElementById('srap-scan').className")
        assert "focus-visible:ring-2" in classes, "focus-visible:ring-2 not found"
        assert "focus-visible:ring-lime-400" in classes, "focus-visible:ring-lime-400 not found"
        assert "focus-visible:outline-none" in classes, "focus-visible:outline-none not found"

        # Check if modal has initial ARIA attributes
        modal_role = await page.evaluate("document.getElementById('custom-modal').getAttribute('role')")
        assert modal_role == "dialog", "Modal role is not dialog"

        modal_aria_hidden = await page.evaluate("document.getElementById('custom-modal').getAttribute('aria-hidden')")
        assert modal_aria_hidden == "true", "Modal aria-hidden is not true initially"

        # 2. Trigger modal and check state
        # Focus on the first SRAP step, simulate clicking to open modal
        await page.evaluate("document.getElementById('srap-scan').focus()")
        await page.click('#srap-scan')

        # Wait for modal to be visible
        await page.wait_for_selector('#custom-modal.flex')

        # Verify aria-hidden changed
        modal_aria_hidden_open = await page.evaluate("document.getElementById('custom-modal').getAttribute('aria-hidden')")
        assert modal_aria_hidden_open == "false", "Modal aria-hidden did not change to false when open"

        # Verify focus is trapped on the primary button inside the modal
        focused_tag = await page.evaluate("document.activeElement.tagName")
        assert focused_tag.lower() == "button", f"Focus should be on button, but was on {focused_tag}"

        focused_text = await page.evaluate("document.activeElement.textContent.trim()")
        assert "Entendido" in focused_text, "Focus is not on the correct button"

        # 3. Close modal and check focus restoration
        await page.click('#custom-modal button')

        # Wait for modal to close (hidden removes display property so wait_for_selector is false for visible)
        await page.wait_for_selector('#custom-modal.hidden', state='attached')
        await page.wait_for_timeout(500) # give a short delay for focus to complete

        # Verify aria-hidden changed back to true
        modal_aria_hidden_closed = await page.evaluate("document.getElementById('custom-modal').getAttribute('aria-hidden')")
        assert modal_aria_hidden_closed == "true", "Modal aria-hidden did not change back to true when closed"

        # Verify focus is restored to the element that opened it
        restored_focus_id = await page.evaluate("document.activeElement.id")
        assert restored_focus_id == "srap-scan", f"Focus was not restored, it is currently on {restored_focus_id}"

        print("✅ All accessibility verifications passed successfully!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())