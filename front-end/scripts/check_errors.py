"""Executa varredura de rotas do front-end e coleta erros.

O script usa Playwright em modo headless para navegar nas principais rotas do
app Vite/React, captura erros de página, mensagens de console (erros/avisos) e
uma screenshot por rota, registrando tudo em um dicionário e imprimindo um
resumo no stdout. As capturas ficam em `screenshots/check-errors/<timestamp>/`.
"""

from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO_ROOT = Path(__file__).resolve().parents[2]
BASE_SCREENSHOTS_DIR = REPO_ROOT / "screenshots" / "check-errors"

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
    """Percorre as rotas, captura erros e gera resumo no console."""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_dir = BASE_SCREENSHOTS_DIR / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)

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

            screenshot_path = output_dir / f"screen_{route.replace('/', '_') or 'home'}.png"
            try:
                page.screenshot(path=str(screenshot_path), full_page=True)
            except Exception:
                pass

            all_errors[route] = {
                "page_errors": errors,
                "console_errors": console_errors,
                "screenshot": str(screenshot_path.resolve()),
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

        print(f"\nScreenshots salvas em: {output_dir.resolve()}")

if __name__ == "__main__":
    run()
