#!/usr/bin/env python3
"""
generate_keys.py
================
Script utilitário para pré-processamento dos dados de sORFs (Manual vs IA).
Lê planilhas Excel (.xlsx) ou CSVs contendo as 55 colunas da tabela_completa,
gera a coluna 'chave' composta canônica e exporta os arquivos padronizados
em UTF-8 para o diretório public/data/.

Regra da chave:
- Prioridade 1: artigo + "_" + Chr + "_" + Start + "_" + End + "_" + Strand
- Prioridade 2 (sem coordenadas): artigo + "_" + original_orf_id
- Prioridade 3: artigo + "_" + orf_id

Uso:
    python scripts/generate_keys.py --input-manual manual_bruto.xlsx --input-ia ia_bruto.xlsx --output-dir public/data/
"""

import os
import sys
import argparse
import pandas as pd

def normalize_text(val):
    if pd.isna(val):
        return ""
    s = str(val).strip()
    if s.upper() in ["NA", "N/A", "NULL", "NONE"]:
        return "NA"
    return s

def build_chave(row):
    artigo = str(row.get('artigo', 'P1')).strip()
    chr_val = str(row.get('Chr', '')).strip()
    start_val = str(row.get('Start', '')).strip()
    end_val = str(row.get('End', '')).strip()
    strand_val = str(row.get('Strand', '')).strip()

    if chr_val and start_val and end_val and strand_val and chr_val != 'NA' and start_val != 'NA':
        return f"{artigo}_{chr_val}_{start_val}_{end_val}_{strand_val}"
    
    orig_id = str(row.get('original_orf_id', '')).strip()
    if orig_id and orig_id != 'NA':
        return f"{artigo}_{orig_id}"
    
    orf_id = str(row.get('orf_id', '')).strip()
    if orf_id and orf_id != 'NA':
        return f"{artigo}_{orf_id}"

    return f"{artigo}_row_{row.name}"

def process_file(filepath, output_csv, default_artigo="P1"):
    print(f"[*] Processando: {filepath}")
    if filepath.endswith('.xlsx') or filepath.endswith('.xls'):
        df = pd.read_excel(filepath)
    else:
        df = pd.read_csv(filepath)

    if 'artigo' not in df.columns:
        print(f"    [!] Coluna 'artigo' não encontrada. Preenchendo com padrão '{default_artigo}'")
        df['artigo'] = default_artigo

    # Gerar ou atualizar a coluna chave
    df['chave'] = df.apply(build_chave, axis=1)

    # Reordenar para chave e artigo ficarem no início
    cols = ['chave', 'artigo'] + [c for c in df.columns if c not in ['chave', 'artigo']]
    df = df[cols]

    # Preencher vazios com NA
    df = df.fillna('NA')

    os.makedirs(os.path.dirname(os.path.abspath(output_csv)), exist_ok=True)
    df.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"[+] Sucesso: {len(df)} registros salvos em {output_csv}")

def main():
    parser = argparse.ArgumentParser(description="Gerador de chave e padronizador de CSVs de sORFs.")
    parser.add_argument("--input-manual", help="Arquivo bruto do braço Manual (.xlsx ou .csv)")
    parser.add_argument("--input-ia", help="Arquivo bruto do braço IA (.xlsx ou .csv)")
    parser.add_argument("--output-dir", default="public/data", help="Diretório de saída (padrão: public/data)")
    args = parser.parse_args()

    if args.input_manual:
        process_file(args.input_manual, os.path.join(args.output_dir, "manual.csv"))
    if args.input_ia:
        process_file(args.input_ia, os.path.join(args.output_dir, "ia.csv"))

    if not args.input_manual and not args.input_ia:
        print("Nenhum arquivo especificado. Exemplo de uso:")
        print("  python scripts/generate_keys.py --input-manual dados_manual.xlsx --input-ia dados_ia.xlsx")

if __name__ == "__main__":
    main()
