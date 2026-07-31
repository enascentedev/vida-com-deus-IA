"""Validação da configuração de ambiente.

Executável como `python -m app.core.config_check`. Sai com código 0 quando a
configuração é válida e 1 quando não é, imprimindo o motivo. Usado como passo
dedicado do CI, antes de rodar migrations ou testes.

Nenhum valor de segredo é impresso — apenas o nome da variável e o problema.
"""

import sys

from pydantic import ValidationError


def main() -> int:
    try:
        from app.core.config import Settings

        settings = Settings()  # type: ignore[call-arg]  # valores vêm do ambiente
    except ValidationError as exc:
        print("Configuração inválida:", file=sys.stderr)
        for error in exc.errors():
            field = ".".join(str(part) for part in error["loc"]) or "(raiz)"
            print(f"  - {field.upper()}: {error['msg']}", file=sys.stderr)
        return 1

    print(f"Configuração válida (environment={settings.environment}).")
    print(f"  app: {settings.app_name} {settings.app_version}")
    print(f"  algoritmo JWT: {settings.jwt_algorithm}")
    print(f"  access token: {settings.jwt_access_token_expire_minutes} min")
    print(f"  refresh token: {settings.jwt_refresh_token_expire_days} dias")
    print(f"  banco de testes configurado: {'sim' if settings.test_database_url else 'não'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
