"""
Captura screenshots de todas as rotas da aplicação em tamanho desktop e mobile
(iPhone 11). As imagens são salvas em
`screenshots/screenshot-routes/{data-hora}/desktop/` e
`screenshots/screenshot-routes/{data-hora}/mobile-iphone11/` na raiz do repo.
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

# Dev server local
BASE_URL = "http://localhost:5173"
REPO_ROOT = Path(__file__).resolve().parents[2]
BASE_SCREENSHOTS_DIR = REPO_ROOT / "screenshots" / "screenshot-routes"

# Credenciais de teste (do .env)
TEST_EMAIL = "screenshots@vidacomdeus.com"
TEST_PASSWORD = "Screenshots@123"

ROTAS = [
    ("/landing",         "landing"),
    ("/login",           "login"),
    ("/cadastro",        "cadastro"),
    ("/recuperar-senha", "recuperar-senha"),
    ("/",                "home"),
    ("/post/post-8e37317a",  "post-detalhe"),
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
    """Percorre rotas e salva screenshots desktop e iPhone 11.

    Args:
        timestamp: sufixo de pasta (ex.: `YYYY-MM-DD_HH-MM-SS`) usado para
            agrupar as imagens em `screenshots/screenshot-routes/<timestamp>/`.
    """
    base_dir = BASE_SCREENSHOTS_DIR / timestamp
    desktop_dir = base_dir / "desktop"
    mobile_dir  = base_dir / "mobile-iphone11"

    desktop_dir.mkdir(parents=True, exist_ok=True)
    mobile_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nDiretório de saída: {base_dir.resolve()}\n")

    with sync_playwright() as p:
        # ── Desktop ────────────────────────────────────────────────────────────
        browser = p.chromium.launch(headless=True)
        ctx_desktop = browser.new_context(viewport=DESKTOP_VIEWPORT)
        
        # Faz login para obter tokens reais
        login_page = ctx_desktop.new_page()
        login_page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        login_page.fill('input[type="email"]', TEST_EMAIL)
        login_page.fill('input[type="password"]', TEST_PASSWORD)
        login_page.click('button[type="submit"]')
        # Aguarda navegação/conteúdo após login (30s máx)
        try:
            login_page.wait_for_url(f"{BASE_URL}/", timeout=30000)
        except Exception:
            login_page.wait_for_load_state("networkidle", timeout=30000)
        login_page.close()
        
        print("[OK] Login realizado com sucesso (desktop)\n")

        for rota, nome in ROTAS:
            page = ctx_desktop.new_page()
            url  = f"{BASE_URL}{rota}"
            print(f"[desktop]  {url}")
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(3000)  # Aguarda 3s para carregar conteúdo
            page.wait_for_load_state("networkidle")  # Aguarda requisições finalizarem
            page.screenshot(
                path=str(desktop_dir / f"{nome}.png"),
                full_page=True,
            )
            page.close()

        ctx_desktop.close()

        # ── Mobile iPhone 11 ───────────────────────────────────────────────────
        ctx_mobile = browser.new_context(**IPHONE_11)
        
        # Faz login para obter tokens reais (mobile)
        login_page_mobile = ctx_mobile.new_page()
        login_page_mobile.goto(f"{BASE_URL}/login", wait_until="networkidle")
        login_page_mobile.fill('input[type="email"]', TEST_EMAIL)
        login_page_mobile.fill('input[type="password"]', TEST_PASSWORD)
        login_page_mobile.click('button[type="submit"]')
        # Aguarda navegação/conteúdo após login (30s máx)
        try:
            login_page_mobile.wait_for_url(f"{BASE_URL}/", timeout=30000)
        except Exception:
            login_page_mobile.wait_for_load_state("networkidle", timeout=30000)
        login_page_mobile.close()
        
        print("[OK] Login realizado com sucesso (mobile)\n")

        for rota, nome in ROTAS:
            page = ctx_mobile.new_page()
            url  = f"{BASE_URL}{rota}"
            print(f"[iphone11] {url}")
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(3000)  # Aguarda 3s para carregar conteúdo
            page.wait_for_load_state("networkidle")  # Aguarda requisições finalizarem
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
