"""
Captura screenshots de todas as rotas da aplicação em tamanho desktop e mobile (iPhone 11).
As imagens são salvas em screenshots/{data-hora}/desktop/ e screenshots/{data-hora}/mobile-iphone11/
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"

ROTAS = [
    ("/landing",         "landing"),
    ("/login",           "login"),
    ("/cadastro",        "cadastro"),
    ("/recuperar-senha", "recuperar-senha"),
    ("/",                "home"),
    ("/post/1",          "post-detalhe"),
    ("/chat",            "chat"),
    ("/biblioteca",      "biblioteca"),
    ("/configuracoes",   "configuracoes"),
    ("/admin",           "admin"),
]

DESKTOP_VIEWPORT = {"width": 1280, "height": 800}

IPHONE_11 = {
    "viewport":          {"width": 390, "height": 844},
    "device_scale_factor": 2,
    "user_agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 "
        "Mobile/15E148 Safari/604.1"
    ),
    "is_mobile":  True,
    "has_touch":  True,
}


def capture(timestamp: str) -> None:
    base_dir = Path("screenshots") / timestamp
    desktop_dir = base_dir / "desktop"
    mobile_dir  = base_dir / "mobile-iphone11"

    desktop_dir.mkdir(parents=True, exist_ok=True)
    mobile_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nDiretório de saída: {base_dir.resolve()}\n")

    with sync_playwright() as p:
        # ── Desktop ────────────────────────────────────────────────────────────
        browser = p.chromium.launch(headless=True)
        ctx_desktop = browser.new_context(viewport=DESKTOP_VIEWPORT)

        for rota, nome in ROTAS:
            page = ctx_desktop.new_page()
            url  = f"{BASE_URL}{rota}"
            print(f"[desktop]  {url}")
            page.goto(url)
            page.wait_for_load_state("networkidle")
            page.screenshot(
                path=str(desktop_dir / f"{nome}.png"),
                full_page=True,
            )
            page.close()

        ctx_desktop.close()

        # ── Mobile iPhone 11 ───────────────────────────────────────────────────
        ctx_mobile = browser.new_context(**IPHONE_11)

        for rota, nome in ROTAS:
            page = ctx_mobile.new_page()
            url  = f"{BASE_URL}{rota}"
            print(f"[iphone11] {url}")
            page.goto(url)
            page.wait_for_load_state("networkidle")
            page.screenshot(
                path=str(mobile_dir / f"{nome}.png"),
                full_page=True,
            )
            page.close()

        ctx_mobile.close()
        browser.close()

    total = len(ROTAS) * 2
    print(f"\nOK: {total} screenshots salvas em: {base_dir.resolve()}")


if __name__ == "__main__":
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    capture(timestamp)
