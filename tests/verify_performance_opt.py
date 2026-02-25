import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Base URL (assuming server running on 8000)
    base_url = "http://localhost:8000/full/index.html"

    print("Step 1: Navigate to Full Version")
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # Verify Initial State
    insight_counter = page.locator("#insight-counter")
    expect(insight_counter).to_have_text("0")
    print("Initial Insight: 0 confirmed.")

    # Step 2: Navigate to Level 2
    print("Step 2: Unlock Level 2")
    # Click the CTA to unlock level 2
    # The text might be partial, so using get_by_role or text containment is safer
    # "¡Vámonos pal Nivel 2 (SRAP)! 🚀"
    # Trying exact text first as it was copied from source

    # Wait for the button to be visible
    level0 = page.locator("#level-0")
    expect(level0).to_be_visible()

    cta_l2 = page.locator("button", has_text="¡Vámonos pal Nivel 2 (SRAP)! 🚀")
    cta_l2.click()

    # Verify Level 2 visible
    expect(page.locator("#level-2")).to_be_visible()
    print("Level 2 visible.")

    # Step 3: Click SRAP Step
    print("Step 3: Click SRAP Step (Scan)")
    srap_scan = page.locator("#srap-scan")
    # Verify initial state (not active)
    # classList should not contain srap-active
    # We use regex for partial match because other classes exist
    expect(srap_scan).not_to_have_class(re.compile(r"srap-active"))

    srap_scan.click()

    # Handle Modal (if any)
    print("Verifying Modal appears")
    modal = page.locator("#custom-modal")
    expect(modal).to_be_visible()

    # Close modal
    page.get_by_text("Entendido, Carnal").click()
    expect(modal).not_to_be_visible()

    # Verify SRAP Step is active
    expect(srap_scan).to_have_class(re.compile(r"srap-active"))
    print("SRAP Scan is active.")

    # Verify Metrics (1 point for scan)
    expect(insight_counter).to_have_text("1")
    print("Insight Counter updated to 1.")

    # Step 4: Unlock Level 3
    print("Step 4: Unlock Level 3")
    # cta button "¡Nivel 3: Caos Controlado! 🌪"
    cta_l3 = page.locator("button", has_text="¡Nivel 3: Caos Controlado! 🌪")
    cta_l3.click()
    expect(page.locator("#level-3")).to_be_visible()

    # Verify Nav Button 3 is active
    nav_btn_3 = page.locator("#nav-btn-3")
    expect(nav_btn_3).to_have_class(re.compile(r"nav-active"))
    print("Nav Button 3 is active.")

    # Step 5: Unlock Level 5
    print("Step 5: Unlock Level 5")
    # cta button "¡Nivel 5: Mandala Multiconsciente! 🎩"
    cta_l5 = page.locator("button", has_text="¡Nivel 5: Mandala Multiconsciente! 🎩")
    cta_l5.click()
    expect(page.locator("#level-5")).to_be_visible()

    # Step 6: Click Hat
    print("Step 6: Click Hat (Creativo)")
    hat_creativo = page.locator("#hat-creativo")

    hat_creativo.click()

    # Handle Modal
    expect(modal).to_be_visible()
    page.get_by_text("Entendido, Carnal").click()

    # Verify Hat Border Color (Lime)
    # We check if the style attribute contains it.
    # Note: style attribute might have spacing differences, so use regex or contains
    # "border-color: var(--neon-lime)"
    # JS sets: hat.style.borderColor = "var(--neon-lime)"
    # This usually reflects in style attribute as "border-color: var(--neon-lime);"
    expect(hat_creativo).to_have_attribute("style", re.compile(r"border-color:\s*var\(--neon-lime\)"))
    print("Hat Creativo has lime border.")

    # Verify Metrics (Previous 1 + 3 = 4)
    expect(insight_counter).to_have_text("4")
    print("Insight Counter updated to 4.")

    print("All verification steps passed.")
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
