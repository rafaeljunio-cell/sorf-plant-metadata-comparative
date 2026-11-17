# sORF Plant Metadata: Manual vs IA

> **Portal comparativo e analítico para validação de anotação de pequenos quadros de leitura aberta (sORFs) em plantas: Curadoria Manual vs Extração por Inteligência Artificial.**

---

## 🔬 Visão Geral

A identificação precisa de pequenos quadros de leitura aberta (*small Open Reading Frames* — sORFs) em genomas vegetais é um desafio central na biologia molecular moderna, especialmente para a anotação de micropeptídeos funcionais originados de lncRNAs ou regiões 5'UTR (uORFs).

Este projeto fornece uma plataforma web 100% estática, de alta performance e visualização científica (otimizada para projetores e telas Full HD 1080p), que permite:

1. **Ingestão Estática Client-Side:** Leitura rápida de arquivos CSV com mais de 55 atributos biológicos via PapaParse, sem necessidade de servidores de backend ou bancos de dados.
2. **Pareamento Determinístico por Chave Genômica:** Alinhamento rigoroso entre a anotação manual e a extração por IA baseado na tupla `artigo + Chr + Start + End + Strand`.
3. **Tabela Interativa:** Paginação (50 linhas/página), busca livre, filtros por publicação, tipo de sORF e evidência, com seletor dinâmico para todas as 55 colunas da `tabela_completa`.
4. **Modo Comparar com Rolagem Sincronizada:** Tela dividida (Manual à esquerda em azul, IA à direita em laranja) com destaque visual em vermelho claro nas células divergentes e filtro exclusivo de divergências.
5. **Dossiê Molecular do sORF:** Modal aprofundado com seções de identificação, coordenadas, sequências completas (nt e aa monoespaçadas com cópia em um clique), anotação gênica, evidências Ribo-seq/espectrometria de massas e links para DOIs.
6. **Painel Analítico de Concordância:** Gráficos dinâmicos com Recharts exibindo porcentagem de concordância por campo (ordenados do menor para o maior acordo), distribuição por artigo e benchmarks de tempo e acurácia.

---

## 🏛️ Arquitetura do Projeto

```
sorf-plant-metadata-comparative/
├── public/
│   └── data/
│       ├── manual.csv        # Dataset curado manualmente (55 colunas + chave + artigo)
│       ├── ia.csv            # Dataset extraído via pipeline de IA
│       └── metricas.csv      # Benchmarks de tempo, preenchimento e juiz cego
├── scripts/
│   └── generate_keys.py      # Utilitário Python para processar planilhas e gerar a coluna chave
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Cabeçalho científico com interruptor triplo (Manual | IA | Comparar)
│   │   ├── DataTable.tsx     # Tabela interativa de dados
│   │   ├── CompareView.tsx   # Visão lado a lado com rolagem sincronizada e diffs
│   │   ├── DetailModal.tsx   # Modal detalhado de inspeção do sORF
│   │   ├── ColumnSelectorModal.tsx # Gerenciador de visibilidade das 55 colunas
│   │   ├── SummaryDashboard.tsx    # Dashboard com métricas e gráficos Recharts
│   │   └── AboutPage.tsx     # Contexto científico, protocolo de 2 fases e referências
│   ├── types/
│   │   └── sorf.ts           # Tipagem TypeScript estrita das 57 colunas
│   ├── utils/
│   │   ├── csvParser.ts      # Parser assíncrono com PapaParse
│   │   └── comparator.ts     # Algoritmo de normalização e diffing campo a campo
│   ├── App.tsx               # Roteamento e orquestração de estados
│   ├── main.tsx              # Ponto de entrada React 18
│   └── index.css             # Diretivas do Tailwind CSS
├── index.html                # Template HTML com fontes Fira Code e Inter
├── package.json              # Dependências e scripts de automação
├── tsconfig.json             # Configuração estrita do TypeScript
├── tailwind.config.js        # Paleta científica personalizada
└── vite.config.ts            # Configuração do bundler Vite
```

---

## 📋 Especificação dos Dados (`tabela_completa`)

Cada registro tabular contempla as seguintes variáveis padronizadas:

| Categoria | Colunas |
| :--- | :--- |
| **Chaves de Pareamento** | `chave`, `artigo` |
| **Identificação** | `original_orf_id`, `original_orf_name`, `orf_name`, `orf_id`, `associated_peptide_id`, `original_sequence` |
| **Classificação** | `orf_type`, `orf_subtype`, `original_orf_type`, `age`, `conservation`, `Kozak`, `signal_peptide`, `start_codon` |
| **Coordenadas** | `Chr`, `Start`, `End`, `Strand`, `original_genome_version`, `anotation_score` |
| **Sequências** | `aa_orf_length`, `nt_transcript_length`, `aa_orf_sequence`, `nt_orf_sequence` |
| **Anotação Gênica** | `gene_id`, `gene_name`, `gene_biotype`, `transcript_id`, `transcript_name`, `transcript_biotype`, `all_genes`, `all_transcripts`, `all_gene_names`, `rnacentral_id` |
| **Evidências Experimentais** | `evidence`, `original_evidence`, `tissue_or_cell`, `pif_hbp`, `cif_hbp`, `dropoff_hbp`, `pif_ribocrypt`, `cif_ribocrypt`, `dropoff_ribocrypt`, `functional_information` |
| **Literatura / Artigo** | `paper_title`, `paper_citation`, `DOI`, `paper_link`, `source`, `data_source`, `expression_group`, `simultaneous_expression` |

---

## ⚙️ Pré-requisitos e Execução Local

Certifique-se de ter o **Node.js 18+** e o **npm** instalados:

```bash
# 1. Clonar o repositório
git clone https://github.com/rafaeljunio-cell/sorf-plant-metadata-comparative.git
cd sorf-plant-metadata-comparative

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

O site estará acessível em `http://localhost:3000`.

Para gerar o build de produção estático:
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`.

---

## 🐍 Pipeline de Dados em Python (`scripts/generate_keys.py`)

Caso possua novos dados brutos em planilhas Excel (`.xlsx`) ou arquivos CSV, utilize o script utilitário para gerar a coluna `chave` canônica e padronizar a exportação:

```bash
# Instalar pandas e openpyxl se necessário
pip install pandas openpyxl

# Executar a padronização
python scripts/generate_keys.py --input-manual dados_brutos_manual.xlsx --input-ia dados_brutos_ia.xlsx --output-dir public/data/
```

---

## 🚀 Publicação no Cloudflare Pages

1. Acesse o **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Selecione o repositório `rafaeljunio-cell/sorf-plant-metadata-comparative`.
3. Configure as instruções de build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Clique em **Save and Deploy**.

A cada novo commit na branch `main`, o Cloudflare Pages gera automaticamente um novo deploy com cache global e suporte offline via service workers.

---

## 👤 Autoria e Pesquisa

- **Rafael Junio Alves** — *Desenvolvimento & Curadoria Genômica*
- **Afiliação:** Universidade Tecnológica Federal do Paraná (UTFPR)
- **Contato:** `rafaeljunio@alunos.utfpr.edu.br`

---

*Licenciado para uso acadêmico e de pesquisa biológica.*
