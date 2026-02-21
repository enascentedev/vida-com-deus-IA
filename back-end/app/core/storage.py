"""Utilitário para leitura e escrita de dados em arquivos JSON locais.

Usado enquanto não há banco de dados real (Fase 1).
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

_ETL_RUNS_FILE = "etl_runs.json"
_MAX_ETL_RUNS = 20


def read_json(filename: str) -> list | dict:
    """Lê um arquivo JSON do diretório data/. Retorna {} se não existir."""
    path = DATA_DIR / filename
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json(filename: str, data: list | dict) -> None:
    """Grava dados em um arquivo JSON no diretório data/."""
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def append_etl_run(run: dict) -> None:
    """Adiciona uma execução ao histórico de ETL (mantém as últimas 20)."""
    data = read_json(_ETL_RUNS_FILE)
    runs = data if isinstance(data, list) else []
    runs.insert(0, run)
    write_json(_ETL_RUNS_FILE, runs[:_MAX_ETL_RUNS])


def get_etl_runs() -> list[dict]:
    """Retorna o histórico de execuções do ETL."""
    data = read_json(_ETL_RUNS_FILE)
    return data if isinstance(data, list) else []
