# Dados locais (`back-end/data/`)

Arquivos JSON usados como persistência da Fase 1, antes da migração para PostgreSQL.

## Todos os registros aqui são fictícios

Nenhum arquivo desta pasta contém dados de pessoas reais. Os registros foram **gerados para demonstração** — os e-mails usam domínios inexistentes (`email.com`, `vidacomdeus.com`) justamente para tornar isso evidente.

## `patients.json` não é versionado

Esse arquivo modela acompanhamento terapêutico e contém campos que, se fossem reais, seriam **dados pessoais sensíveis de saúde** — categoria protegida pelo art. 11 da LGPD:

`chief_complaint` · `anxiety_level` · `depression_level` · `sleep_quality` · `suicidal_ideation` · `current_medication` · `therapeutic_approach`

Ainda que os valores sejam sintéticos, manter esse formato em um repositório público é ruim por dois motivos: convida ao uso do arquivo como se fosse base real, e normaliza o versionamento de estruturas de dados de saúde. Por isso ele está no `.gitignore` da raiz.

**Consequência prática:** ao clonar o repositório, `patients.json` não vem junto. Nada quebra — na primeira leitura, `_load_patients()` (`app/api/v1/therapist.py`) recria o arquivo a partir da constante `MOCK_PATIENTS`.

### Isto resolve o problema apenas em parte

Seja honesto sobre o alcance da medida: **os mesmos registros continuam no repositório**, agora como a constante `MOCK_PATIENTS` em `app/api/v1/therapist.py` — 9 registros, com os mesmos campos sensíveis listados acima. Tirar o JSON do versionamento evita que o arquivo seja tratado como base de dados pronta, mas **não remove os dados do código-fonte público**.

Resolver de fato exige uma destas rotas, ainda não executadas:

1. mover os dados de demonstração para uma fixture de teste, fora do pacote da aplicação;
2. gerar os registros em tempo de execução (faker/seed), sem valores fixos no código;
3. reduzir os campos da constante ao mínimo necessário para a interface funcionar, eliminando os marcadores clínicos.

### Histórico

O arquivo foi versionado em commits anteriores e **permanece no histórico do Git**. Nenhuma reescrita de histórico foi feita — é operação destrutiva, que exige decisão explícita e coordenação com quem já clonou o repositório.

## Ao adicionar novos arquivos aqui

Não coloque dados de pessoas reais, nem dados sintéticos que imitem categorias sensíveis (saúde, biometria, orientação religiosa individualizada, dados de crianças). Se precisar de um caso de teste com esse formato, mantenha o arquivo fora do versionamento e documente-o aqui.
