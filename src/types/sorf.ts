export interface SorfRecord {
  // Identificadores e Chave
  chave: string;
  artigo: string; // P1 a P4

  // 55 colunas da tabela_completa
  original_sequence?: string;
  original_orf_name?: string;
  original_orf_type?: string;
  orf_name?: string;
  orf_type?: string;
  orf_subtype?: string;
  Chr?: string;
  Start?: string | number;
  End?: string | number;
  Strand?: string;
  nt_transcript_length?: string | number;
  aa_orf_length?: string | number;
  nt_orf_sequence?: string;
  aa_orf_sequence?: string;
  transcript_id?: string;
  gene_id?: string;
  gene_name?: string;
  gene_biotype?: string;
  all_transcripts?: string;
  all_genes?: string;
  all_gene_names?: string;
  age?: string;
  disease_original?: string;
  disease?: string;
  disease_subtype?: string;
  tissue_or_cell?: string;
  evidence?: string;
  original_evidence?: string;
  DOI?: string;
  paper_link?: string;
  paper_title?: string;
  paper_citation?: string;
  source?: string;
  conservation?: string;
  signal_peptide?: string;
  Kozak?: string;
  functional_information?: string;
  start_codon?: string;
  simultaneous_expression?: string;
  rnacentral_id?: string;
  expression_group?: string;
  data_source?: string;
  transcript_name?: string;
  original_genome_version?: string;
  anotation_score?: string | number;
  original_orf_id?: string;
  transcript_biotype?: string;
  pif_hbp?: string | number;
  cif_hbp?: string | number;
  dropoff_hbp?: string | number;
  pif_ribocrypt?: string | number;
  cif_ribocrypt?: string | number;
  dropoff_ribocrypt?: string | number;
  orf_id?: string;
  associated_peptide_id?: string;

  // Permitir acesso dinâmico por chave
  [key: string]: string | number | undefined;
}

export type SourceType = 'manual' | 'ia' | 'comparar';

export type ComparisonStatus = 'both' | 'manual_only' | 'ia_only';

export interface AlignedComparisonRow {
  chave: string;
  artigo: string;
  status: ComparisonStatus;
  manualRecord?: SorfRecord;
  iaRecord?: SorfRecord;
  divergentFields: string[]; // Lista de colunas que diferem
  hasDivergence: boolean;
}

export interface MetricRecord {
  artigo: string;
  braco: 'manual' | 'ia';
  tempo_min: number;
  campos_preenchidos: number;
  acerto_juiz: number;
}

export interface FieldAgreement {
  field: string;
  label: string;
  totalCompared: number;
  concordantCount: number;
  percentage: number;
}

export interface ArticleAgreement {
  artigo: string;
  totalChaves: number;
  inBoth: number;
  manualOnly: number;
  iaOnly: number;
  overallAgreementPct: number;
}
