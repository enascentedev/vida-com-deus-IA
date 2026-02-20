from playwright.sync_api import sync_playwright
import json

ROUTES = [
    "/",
    "/landing",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/chat",
    "/biblioteca",
    "/configuracoes",
    "/admin",
    "/post/1",
]

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        all_errors = {}

        for route in ROUTES:
            url = f"http://localhost:5173{route}"
            page = browser.new_page()
            errors = []
            console_errors = []

            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)

            try:
                page.goto(url, timeout=15000)
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception as e:
                errors.append(f"NAVIGATION ERROR: {e}")

            screenshot_path = f"/tmp/screen_{route.replace('/', '_') or 'home'}.png"
            try:
                page.screenshot(path=screenshot_path, full_page=True)
            except Exception:
                pass

            all_errors[route] = {
                "page_errors": errors,
                "console_errors": console_errors,
                "screenshot": screenshot_path,
            }
            page.close()

        browser.close()

        print("\n=== RESULTADO POR ROTA ===\n")
        has_errors = False
        for route, data in all_errors.items():
            errs = data["page_errors"] + data["console_errors"]
            if errs:
                has_errors = True
                print(f"[ERRO] {route}")
                for e in errs:
                    print(f"   {e}")
            else:
                print(f"[OK]   {route} -- sem erros")

        if not has_errors:
            print("\nNenhum erro encontrado em nenhuma rota!")

if __name__ == "__main__":
    run()
