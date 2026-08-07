"""Script para obter tokens de autenticação via API."""

import requests
import json

API_BASE = "http://localhost:8000/v1"
EMAIL = "teste@vidacomdeus.com"
PASSWORD = "Teste@123"

try:
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=10
    )
    response.raise_for_status()
    tokens = response.json()
    
    print("✓ Login bem-sucedido!")
    print(f"\nAccess Token: {tokens['access_token'][:50]}...")
    print(f"Refresh Token: {tokens['refresh_token'][:50]}...")
    
    # Salva em arquivo para uso no script de screenshots
    with open("auth-tokens.json", "w") as f:
        json.dump(tokens, f, indent=2)
    
    print("\n✓ Tokens salvos em auth-tokens.json")
    
except requests.exceptions.ConnectionError:
    print("✗ Erro: Back-end não está rodando em http://localhost:8000")
except requests.exceptions.HTTPError as e:
    print(f"✗ Erro HTTP: {e.response.status_code}")
    print(f"  Mensagem: {e.response.json().get('detail', 'Erro desconhecido')}")
except Exception as e:
    print(f"✗ Erro: {e}")
