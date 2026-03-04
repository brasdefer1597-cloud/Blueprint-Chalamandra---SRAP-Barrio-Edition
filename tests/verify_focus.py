import asyncio
import http.server
import socketserver
import threading
from playwright.async_api import async_playwright

PORT = 0

def serve(event):
    global PORT
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        PORT = httpd.server_address[1]
        print("serving at port", PORT)
        event.set()
        httpd.serve_forever()

async def verify_focus():
    server_ready = threading.Event()
    server_thread = threading.Thread(target=serve, args=(server_ready,), daemon=True)
    server_thread.start()
    server_ready.wait()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        url = f"http://localhost:{PORT}/full/index.html"
        await page.goto(url)

        # Advance to level 2 to see .srap-step elements
        await page.evaluate("unlockAndRenderLevel(2)")

        # Focus the first SRAP step element
        element = page.locator(".srap-step").first
        await element.focus()

        # Check if the required classes were added
        class_name = await element.evaluate("el => el.className")
        print(f"Classes on focused element: {class_name}")

        if "focus-visible:outline-none" in class_name and "focus-visible:ring-2" in class_name and "focus-visible:ring-lime-400" in class_name:
            print("Successfully verified focus-visible classes are present on interactive elements")
        else:
            print("Failed to verify focus-visible classes")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_focus())