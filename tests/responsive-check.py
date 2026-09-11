from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
URL = "http://127.0.0.1:8000/index.html"


def check_page(page, expected_device, expected_bottom_nav):
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(250)

    device = page.locator("html").get_attribute("data-device")
    bottom_nav_display = page.locator(".mobile-bottom-nav").evaluate(
        "(node) => getComputedStyle(node).display"
    )
    product_count = page.locator("#productGrid .product-card").count()

    assert device == expected_device, (device, expected_device)
    assert (bottom_nav_display != "none") is expected_bottom_nav, bottom_nav_display
    assert product_count == 8, product_count

    page.get_by_role("button", name="查看详情").first.click()
    assert page.locator("#detailModal.open").count() == 1
    page.get_by_role("button", name="关闭详情").click()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    desktop = browser.new_page(viewport={"width": 1440, "height": 900})
    check_page(desktop, "desktop", False)
    desktop.screenshot(path=str(ROOT / "output" / "desktop-responsive.png"), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
    check_page(mobile, "mobile", True)
    mobile.screenshot(path=str(ROOT / "output" / "mobile-responsive.png"), full_page=True)

    mobile.get_by_role("button", name="登录").click()
    assert mobile.locator("#authModal.open").count() == 1
    mobile.get_by_role("button", name="关闭账户窗口").click()

    browser.close()

print("responsive checks passed")
