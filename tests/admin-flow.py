from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://127.0.0.1:8000/index.html")
    page.wait_for_load_state("networkidle")
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")

    page.get_by_role("button", name="登录").click()
    page.get_by_role("button", name="注册").click()
    page.locator("#registerForm input[name=email]").fill("demo@example.com")
    page.locator("#registerForm input[name=password]").fill("secret123")
    page.locator("#registerForm input[name=recipient]").fill("小林")
    page.locator("#registerForm input[name=phone]").fill("13800138000")
    page.locator("#registerForm input[name=detail]").fill("上海市静安区宠物路 8 号")
    page.get_by_role("button", name="注册并登录").click()
    page.get_by_role("button", name="加入购物车").first.click()
    page.get_by_role("button", name="确认收货地址").click()
    page.get_by_role("button", name="确认下单").click()
    assert page.locator("#successModal.open").count() == 1
    assert page.evaluate("JSON.parse(localStorage.getItem('Ianhe-orders')).length") == 1

    admin = browser.new_page(viewport={"width": 1440, "height": 900})
    admin.goto("http://127.0.0.1:8000/admin.html")
    admin.wait_for_load_state("networkidle")
    assert admin.locator("#ordersBody tr").count() == 4
    assert "¥117.00" in admin.locator("#metricGrid").inner_text()

    admin.locator("input[name=name]").fill("鸡肉芝士新品")
    admin.locator("input[name=foodCategory]").fill("肉类零食")
    admin.locator("input[name=price]").fill("29.9")
    admin.locator("input[name=spec]").fill("80g / 袋")
    admin.locator("input[name=ingredients]").fill("鸡胸肉、芝士")
    admin.locator("textarea[name=suitableFor]").fill("适合日常训练奖励")
    admin.get_by_role("button", name="保存并同步到商城").click()
    assert admin.locator("#productMessage").inner_text() == "新品已保存，刷新商城即可看到。"
    admin.goto("http://127.0.0.1:8000/index.html")
    admin.wait_for_load_state("networkidle")
    assert admin.locator("#productGrid .product-card").count() == 9
    assert admin.get_by_role("heading", name="鸡肉芝士新品").count() == 1

    page.screenshot(path=str(ROOT / "output" / "admin-flow-desktop.png"), full_page=True)
    browser.close()

print("admin flow passed")
