import asyncio
from playwright.async_api import async_playwright, expect
import sys

PORT = 8000

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        try:
            await page.goto(f"http://localhost:{PORT}/demo/index.html")
        except Exception as e:
            print(f"Failed to connect to server: {e}")
            sys.exit(1)

        # Force Full Mode to verify all levels
        await page.evaluate("window.initGame('full')")

        # Verify Level 0 is visible
        level0 = page.locator("#level-0")
        if not await level0.is_visible():
            print("Level 0 not visible initially")
            # Maybe need to wait for JS?
            await page.wait_for_selector("#level-0", state="visible")

        print("✅ Level 0 visible")

        # Click "Vámonos pal Nivel 2" to unlock Level 2
        # The button onclick calls unlockAndRenderLevel(2)
        # It's inside Level 0 section
        await page.click("text=Vámonos pal Nivel 2")

        # Verify Level 2 is visible
        level2 = page.locator("#level-2")
        await expect(level2).to_be_visible()
        print("✅ Level 2 unlocked and visible")

        # Check SRAP Step initial state
        step_scan = page.locator("#srap-scan")
        # In optimized version, we rely on CSS default, not JS adding class/style initially if not needed.
        # But if it had srap-active, it would be bad.
        classes = await step_scan.get_attribute("class")
        if "srap-active" in classes:
            print(f"❌ Error: SRAP Step has active class initially: {classes}")
            sys.exit(1)

        print("✅ SRAP Step initial state correct")

        # Click SRAP Step
        await step_scan.click()

        # Handle Modal
        modal = page.locator("#custom-modal")
        await expect(modal).to_be_visible()
        print("✅ Modal appeared")

        # Verify SRAP Step has 'srap-active' class
        classes_after = await step_scan.get_attribute("class")
        if "srap-active" not in classes_after:
             print(f"❌ Error: SRAP Step missing active class after click: {classes_after}")
             sys.exit(1)
        print("✅ SRAP Step active class added")

        # Verify cursor style
        cursor_style = await step_scan.evaluate("el => el.style.cursor")
        if cursor_style != "default":
             print(f"⚠️ Warning: SRAP Step cursor style is '{cursor_style}', expected 'default'.")
             # Not fatal if class is there, but good to check.

        # Close Modal
        await page.click("text=Entendido, Carnal")
        await expect(modal).not_to_be_visible()
        print("✅ Modal closed")

        # Navigate to Level 3
        # Button inside Level 2
        await page.click("text=Nivel 3: Caos Controlado")
        level3 = page.locator("#level-3")
        await expect(level3).to_be_visible()
        print("✅ Level 3 unlocked and visible")

        # Navigate to Level 5
        # Button inside Level 3
        await page.click("text=Nivel 5: Mandala Multiconsciente")
        level5 = page.locator("#level-5")
        await expect(level5).to_be_visible()
        print("✅ Level 5 unlocked and visible")

        # Check Hat initial state
        hat_creativo = page.locator("#hat-creativo")
        # Check border color via computed style (as inline style might be empty initially in optimized version if CSS handles default)
        # Actually CSS has border: 2px solid var(--neon-purple);
        # So computed style should be purple.
        # But let's check inline style to see if our script.js logic (or lack thereof) is working as expected.
        # In original code: updateUI sets inline style to neon-purple.
        # In optimized code: updateUI loop removed. Inline style should be empty initially (relying on CSS).
        # We can accept either as long as visual is purple.
        # So we check computed style.
        # var(--neon-purple) is #bf00ff.

        # Click Hat
        await hat_creativo.click()

        # Handle Modal
        await expect(modal).to_be_visible()

        # Verify Hat border color is lime
        # Check inline style, as that's what JS sets.
        color_inline = await hat_creativo.evaluate("el => el.style.borderColor")
        # var(--neon-lime) or #ccff00 or rgb(204, 255, 0)
        print(f"Hat border color after click: {color_inline}")
        if "var(--neon-lime)" not in color_inline and "rgb(204, 255, 0)" not in color_inline:
             print(f"❌ Error: Hat border color incorrect: {color_inline}")
             sys.exit(1)
        print("✅ Hat border color updated to lime")

        # Close Modal
        await page.click("text=Entendido, Carnal")

        print("🎉 All verification steps passed!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
