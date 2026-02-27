from playwright.sync_api import sync_playwright

def verify_target_blank():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to the local server
        page.goto("http://localhost:3000/demo/index.html")

        # Inject script to show the paywall modal (since we need to test the link inside it)
        # The modal contains the link we modified
        page.evaluate("showPaywallModal()")

        # Wait for modal to appear
        page.wait_for_selector("#custom-modal")

        # Find the link with the specific href
        link_selector = 'a[href="https://ko-fi.com/s/8b46c1c1cd"]'
        page.wait_for_selector(link_selector)

        # Get the element
        link = page.query_selector(link_selector)

        # Check attributes
        target = link.get_attribute("target")
        rel = link.get_attribute("rel")

        print(f"Target: {target}")
        print(f"Rel: {rel}")

        # Assertions
        if target == "_blank" and rel == "noopener noreferrer":
            print("✅ VERIFICATION PASSED: Link has target='_blank' and rel='noopener noreferrer'")
        else:
            print("❌ VERIFICATION FAILED: Attributes do not match expected values.")

        # Take screenshot of the modal with the link
        page.screenshot(path="verification/paywall_modal.png")

        browser.close()

if __name__ == "__main__":
    verify_target_blank()
