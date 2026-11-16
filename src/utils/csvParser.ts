import Papa from 'papaparse';
import { SorfRecord, MetricRecord } from '../types/sorf';

export async function fetchAndParseSorfCsv(url: string): Promise<SorfRecord[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao carregar CSV (${response.status}): ${url}`);
    }
    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse<SorfRecord>(text, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          // Filtra linhas que estejam completamente vazias
          const validRows = results.data.filter((row) => {
            return row.chave || row.artigo || row.original_orf_id || row.Chr;
          });
          resolve(validRows);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (err) {
    console.error(`Erro ao carregar dados de ${url}:`, err);
    return [];
  }
}

export async function fetchAndParseMetrics(url: string): Promise<MetricRecord[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    return new Promise((resolve) => {
      Papa.parse<any>(text, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const metrics: MetricRecord[] = results.data
            .filter((r) => r.artigo && r.braco)
            .map((r) => ({
              artigo: String(r.artigo).trim(),
              braco: String(r.braco).trim().toLowerCase() === 'ia' ? 'ia' : 'manual',
              tempo_min: parseFloat(r.tempo_min) || 0,
              campos_preenchidos: parseInt(r.campos_preenchidos, 10) || 0,
              acerto_juiz: parseFloat(r.acerto_juiz) || 0,
            }));
          resolve(metrics);
        },
        error: () => resolve([]),
      });
    });
  } catch (err) {
    console.warn(`Métricas opcionais não encontradas em ${url}:`, err);
    return [];
  }
}
