import { SorfRecord, AlignedComparisonRow, FieldAgreement, ArticleAgreement } from '../types/sorf';

// Normaliza strings para comparação justa conforme o guia (ignora maiúsculas/minúsculas, trim, NA vs vazio)
export function normalizeValue(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (s === '' || s.toUpperCase() === 'NA' || s.toUpperCase() === 'N/A' || s.toLowerCase() === 'null') {
    return '';
  }
  return s.toLowerCase();
}

export function areValuesEqual(val1: any, val2: any): boolean {
  return normalizeValue(val1) === normalizeValue(val2);
}

// Gera a chave canônica se não estiver presente
export function getRecordKey(rec: SorfRecord): string {
  if (rec.chave && String(rec.chave).trim() !== '') {
    return String(rec.chave).trim();
  }
  const artigo = String(rec.artigo || 'P1').trim();
  const chr = String(rec.Chr || '').trim();
  const start = String(rec.Start || '').trim();
  const end = String(rec.End || '').trim();
  const strand = String(rec.Strand || '').trim();
  
  if (chr && start && end && strand) {
    return `${artigo}_${chr}_${start}_${end}_${strand}`;
  }
  if (rec.original_orf_id && String(rec.original_orf_id).trim() !== '') {
    return `${artigo}_${String(rec.original_orf_id).trim()}`;
  }
  return `${artigo}_${rec.orf_id || Math.random().toString(36).substring(7)}`;
}

export function alignComparisonRecords(
  manualList: SorfRecord[],
  iaList: SorfRecord[],
  allColumns: string[]
): AlignedComparisonRow[] {
  const manualMap = new Map<string, SorfRecord>();
  const iaMap = new Map<string, SorfRecord>();

  manualList.forEach((r) => {
    const key = getRecordKey(r);
    manualMap.set(key, r);
  });

  iaList.forEach((r) => {
    const key = getRecordKey(r);
    iaMap.set(key, r);
  });

  const allKeys = Array.from(new Set([...manualMap.keys(), ...iaMap.keys()]));
  
  // Colunas que serão inspecionadas quanto a divergências
  const compareCols = allColumns.filter(c => c !== 'chave');

  const rows: AlignedComparisonRow[] = allKeys.map((key) => {
    const manual = manualMap.get(key);
    const ia = iaMap.get(key);
    const artigo = manual?.artigo || ia?.artigo || 'P1';

    if (manual && ia) {
      const divergentFields: string[] = [];
      for (const col of compareCols) {
        if (!areValuesEqual(manual[col], ia[col])) {
          divergentFields.push(col);
        }
      }
      return {
        chave: key,
        artigo,
        status: 'both',
        manualRecord: manual,
        iaRecord: ia,
        divergentFields,
        hasDivergence: divergentFields.length > 0,
      };
    } else if (manual && !ia) {
      return {
        chave: key,
        artigo,
        status: 'manual_only',
        manualRecord: manual,
        divergentFields: [],
        hasDivergence: true,
      };
    } else {
      return {
        chave: key,
        artigo,
        status: 'ia_only',
        iaRecord: ia,
        divergentFields: [],
        hasDivergence: true,
      };
    }
  });

  // Ordenar alfabeticamente por artigo e chave
  return rows.sort((a, b) => a.chave.localeCompare(b.chave));
}

export function calculateFieldAgreements(
  alignedRows: AlignedComparisonRow[],
  columns: string[]
): FieldAgreement[] {
  const commonRows = alignedRows.filter((r) => r.status === 'both');
  if (commonRows.length === 0) return [];

  const compareCols = columns.filter((c) => c !== 'chave' && c !== 'artigo');

  const results: FieldAgreement[] = compareCols.map((col) => {
    let concordantCount = 0;
    commonRows.forEach((row) => {
      if (areValuesEqual(row.manualRecord?.[col], row.iaRecord?.[col])) {
        concordantCount++;
      }
    });
    const percentage = Number(((concordantCount / commonRows.length) * 100).toFixed(1));
    return {
      field: col,
      label: col.replace(/_/g, ' '),
      totalCompared: commonRows.length,
      concordantCount,
      percentage,
    };
  });

  // Ordena do menor acordo para o maior conforme especificação do Prompt 6
  return results.sort((a, b) => a.percentage - b.percentage);
}

export function calculateArticleAgreements(alignedRows: AlignedComparisonRow[]): ArticleAgreement[] {
  const articles = Array.from(new Set(alignedRows.map((r) => r.artigo))).sort();

  return articles.map((art) => {
    const artRows = alignedRows.filter((r) => r.artigo === art);
    const inBoth = artRows.filter((r) => r.status === 'both');
    const manualOnly = artRows.filter((r) => r.status === 'manual_only').length;
    const iaOnly = artRows.filter((r) => r.status === 'ia_only').length;

    let totalFieldsCompared = 0;
    let totalFieldsAgreed = 0;

    inBoth.forEach((row) => {
      if (row.manualRecord && row.iaRecord) {
        const keys = Object.keys(row.manualRecord).filter((k) => k !== 'chave');
        keys.forEach((k) => {
          totalFieldsCompared++;
          if (areValuesEqual(row.manualRecord?.[k], row.iaRecord?.[k])) {
            totalFieldsAgreed++;
          }
        });
      }
    });

    const overallAgreementPct = totalFieldsCompared > 0
      ? Number(((totalFieldsAgreed / totalFieldsCompared) * 100).toFixed(1))
      : 0;

    return {
      artigo: art,
      totalChaves: artRows.length,
      inBoth: inBoth.length,
      manualOnly,
      iaOnly,
      overallAgreementPct,
    };
  });
}
