export interface ColumnDefinition {
  title: string;
  category: string;
  description: string;
  example?: string;
}

export const COLUMN_DEFINITIONS: Record<string, ColumnDefinition> = {
  // Chave e Identificação do Artigo
  chave: {
    title: 'Chave Composta',
    category: 'Identificação & Pareamento',
    description: 'Chave única de pareamento formada pela combinação de artigo + Chr + Start + End + Strand. Permite alinhar com precisão registros correspondentes entre os braços Manual e IA.',
    example: 'P1_Chr1_104520_104820_+',
  },
  artigo: {
    title: 'Artigo Científico',
    category: 'Origem dos Dados',
    description: 'Código do artigo científico de onde os dados do sORF foram extraídos (P1 a P4 no projeto comparativo).',
    example: 'P1, P2, P3, P4',
  },
  original_orf_id: {
    title: 'ID Original do sORF',
    category: 'Identificação',
    description: 'Identificador do sORF tal como atribuído no artigo científico ou na base de dados de origem.',
    example: 'At1g01010.sORF1, sORF_00124',
  },
  orf_id: {
    title: 'ID Padronizado do sORF',
    category: 'Identificação',
    description: 'Identificador padronizado atribuído ao Open Reading Frame na base consolidada.',
    example: 'sORF_P1_0042',
  },
  original_orf_name: {
    title: 'Nome Original do sORF',
    category: 'Identificação',
    description: 'Denominação original ou alias atribuído ao sORF no trabalho de referência.',
  },
  orf_name: {
    title: 'Nome do sORF',
    category: 'Identificação',
    description: 'Nome consolidado ou nomenclatura uniforme para o sORF.',
  },

  // Classificação do ORF
  orf_type: {
    title: 'Tipo de sORF (ORF Type)',
    category: 'Classificação Estrutural',
    description: 'Classificação do pequeno ORF com base em sua posição relativa aos genes e transcritos anotados. Inclui uORF (na 5\' UTR), dORF (na 3\' UTR), lncRNA-sORF (em RNA não-codificante longo), internal/iORF (sobreposto à região codificante CDS), intergênico (entre genes) ou pseudogene-sORF.',
    example: 'lncRNA-sORF, uORF, dORF, internal, intergenic',
  },
  original_orf_type: {
    title: 'Tipo de sORF Original',
    category: 'Classificação Estrutural',
    description: 'Classificação do tipo de sORF conforme constava no artigo científico original antes de padronizações.',
  },
  orf_subtype: {
    title: 'Subtipo de sORF',
    category: 'Classificação Estrutural',
    description: 'Subclassificação detalhada do sORF (ex.: sobreposto em fase, fora de fase, upstream/downstream alternativo).',
  },

  // Coordenadas Genômicas
  chr: {
    title: 'Cromossomo (Chr)',
    category: 'Coordenadas Genômicas',
    description: 'Cromossomo ou scaffold de referência da planta onde o sORF está mapeado.',
    example: 'Chr1, Chr2, Chr3, Chr4, Chr5, ChrM, ChrPt',
  },
  start: {
    title: 'Posição Inicial (Start)',
    category: 'Coordenadas Genômicas',
    description: 'Coordenada genômica de início (posição nucleotídica 1-based no cromossomo) onde começa o códon de iniciação da região codificante do sORF.',
    example: '104520, 2450123',
  },
  end: {
    title: 'Posição Final (End)',
    category: 'Coordenadas Genômicas',
    description: 'Coordenada genômica final (posição nucleotídica no cromossomo) onde termina o códon de parada da região codificante do sORF.',
    example: '104820, 2450332',
  },
  strand: {
    title: 'Fita (Strand)',
    category: 'Coordenadas Genômicas',
    description: 'Fita do DNA em que o sORF é codificado e transcrito: fita senso/positiva (+) ou fita antissenso/negativa (-).',
    example: '+ ou -',
  },
  original_genome_version: {
    title: 'Versão do Genoma de Referência',
    category: 'Coordenadas Genômicas',
    description: 'Versão da montagem do genoma (assembly) da planta utilizada no mapeamento das coordenadas (ex.: TAIR10, Araport11).',
    example: 'TAIR10, Araport11',
  },

  // Comprimentos e Sequências
  aa_orf_length: {
    title: 'Comprimento do Peptídeo (AA)',
    category: 'Proteômica & Tradução',
    description: 'Número de resíduos de aminoácidos resultantes da tradução do sORF. Pequenos ORFs (sORFs) tipicamente codificam peptídeos com até 100 aminoácidos (≤ 100 aa).',
    example: '45 aa, 72 aa',
  },
  aa_orf_sequence: {
    title: 'Sequência de Aminoácidos (AA)',
    category: 'Proteômica & Tradução',
    description: 'Sequência primária de aminoácidos traduzida do sORF, representada no código de uma letra padrão (IUPAC).',
    example: 'MDSTKAGLLVY...',
  },
  nt_transcript_length: {
    title: 'Comprimento do Transcrito (nt)',
    category: 'Genômica & Transcritômica',
    description: 'Comprimento total do transcrito de RNA mensageiro ou não-codificante onde o sORF está inserido, medido em nucleotídeos (nt).',
    example: '1240 nt, 850 nt',
  },
  nt_orf_sequence: {
    title: 'Sequência de Nucleotídeos (nt)',
    category: 'Genômica & Transcritômica',
    description: 'Sequência nucleotídica completa da região codificadora do sORF, do códon de início (ex.: ATG) até o códon de parada.',
    example: 'ATGGATTCAACCAAA...',
  },
  associated_peptide_id: {
    title: 'ID do Peptídeo Associado',
    category: 'Proteômica & Tradução',
    description: 'Identificador do produto peptídico gerado pela tradução do sORF em bases proteômicas.',
  },

  // Biologia & Regulação da Tradução
  start_codon: {
    title: 'Códon de Início (Start Codon)',
    category: 'Regulação da Tradução',
    description: 'Trinca de nucleotídeos de iniciação da tradução. Pode ser o códon canônico ATG (Metionina) ou códons não-canônicos comuns em sORFs vegetais (CTG, GTG, TTG).',
    example: 'ATG, CTG, GTG, TTG',
  },
  kozak: {
    title: 'Contexto Kozak',
    category: 'Regulação da Tradução',
    description: 'Sequência de consenso ao redor do códon de início que influencia a eficiência de reconhecimento pelo ribossomo na iniciação da tradução.',
    example: 'Adequado, Forte, Fraco',
  },
  signal_peptide: {
    title: 'Peptídeo Sinal',
    category: 'Biologia Celular',
    description: 'Indicação da presença de um sinal N-terminal de secreção ou direcionamento a organelas (ex.: cloroplasto, mitocôndria).',
    example: 'Yes / No, Predito',
  },
  conservation: {
    title: 'Conservação Evolutiva',
    category: 'Genômica Comparativa',
    description: 'Grau de conservação filogenética do sORF entre diferentes espécies vegetais ou linhagens filogenéticas.',
    example: 'Alta, Moderada, Específica de espécie',
  },
  functional_information: {
    title: 'Informação Funcional',
    category: 'Anotação Funcional',
    description: 'Dados biológicos ou fenotípicos conhecidos sobre a função do pequeno peptídeo na fisiologia ou desenvolvimento vegetal.',
    example: 'Resposta a estresse hídrico, regulação de desenvolvimento',
  },

  // Evidências Experimentais
  evidence: {
    title: 'Evidência Experimental / Suporte',
    category: 'Validação Biológica',
    description: 'Método experimental ou bioinformático que comprova a tradução do sORF. Exemplos incluem Ribo-seq (perfilamento de ribossomos), espectrometria de massas (MS), RiboCrypt ou predição in silico.',
    example: 'Ribo-seq, MS, Ribo-seq + MS, RiboCrypt',
  },
  original_evidence: {
    title: 'Evidência Original',
    category: 'Validação Biológica',
    description: 'Descrição original do suporte experimental registrada no estudo primário de publicação.',
  },
  tissue_or_cell: {
    title: 'Tecido ou Linhagem Celular',
    category: 'Expressão Biológica',
    description: 'Órgão vegetal, tecido ou linhagem de células onde foi confirmada a expressão ou tradução do sORF (ex.: folhas, raízes, ápice caulinar, plântulas).',
    example: 'Folha, Raiz, Plântula, Flor',
  },
  expression_group: {
    title: 'Grupo de Expressão',
    category: 'Expressão Biológica',
    description: 'Grupo ou padrão temporal/espacial de expressão em que o sORF é ativo.',
  },
  simultaneous_expression: {
    title: 'Expressão Simultânea',
    category: 'Expressão Biológica',
    description: 'Registro de co-expressão com outros transcritos ou proteínas no mesmo tecido.',
  },

  // Genes e Transcritos
  gene_id: {
    title: 'ID do Gene',
    category: 'Anotação Gênica',
    description: 'Identificador estável do gene anotado associado a este sORF no genoma de referência.',
    example: 'AT1G01010, AT3G12340',
  },
  gene_name: {
    title: 'Nome do Gene',
    category: 'Anotação Gênica',
    description: 'Símbolo ou nome canônico do gene relacionado na literatura.',
  },
  gene_biotype: {
    title: 'Biotipo do Gene',
    category: 'Anotação Gênica',
    description: 'Classificação do tipo de gene (ex.: protein_coding, lncRNA, pseudogene, miRNA, snRNA).',
    example: 'protein_coding, lncRNA',
  },
  transcript_id: {
    title: 'ID do Transcrito',
    category: 'Transcritômica',
    description: 'Identificador do transcrito de RNA onde o sORF está contido.',
    example: 'AT1G01010.1',
  },
  transcript_name: {
    title: 'Nome do Transcrito',
    category: 'Transcritômica',
    description: 'Denominação alternativa ou descritiva do transcrito de RNA.',
  },
  transcript_biotype: {
    title: 'Biotipo do Transcrito',
    category: 'Transcritômica',
    description: 'Tipo funcional do transcrito de RNA (ex.: mRNA, lncRNA, antisense).',
  },
  all_transcripts: {
    title: 'Todos os Transcritos Sobrepostos',
    category: 'Transcritômica',
    description: 'Lista de múltiplos transcritos que cobrem a mesma região genômica.',
  },
  all_genes: {
    title: 'Todos os Genes Associados',
    category: 'Anotação Gênica',
    description: 'Lista de todos os loci gênicos que compartilham a coordenada genômica.',
  },
  all_gene_names: {
    title: 'Nomes de Todos os Genes',
    category: 'Anotação Gênica',
    description: 'Nomes e símbolos de todos os genes sobrepostos à região.',
  },
  rnacentral_id: {
    title: 'ID RNAcentral',
    category: 'Bancos de Dados Externos',
    description: 'Identificador único do transcrito no banco de dados RNAcentral de RNAs não-codificantes.',
    example: 'URS000080E2FE',
  },

  // Publicação e Fontes
  doi: {
    title: 'DOI da Publicação',
    category: 'Referência Bibliográfica',
    description: 'Digital Object Identifier do artigo científico original de onde os dados do sORF foram obtidos.',
    example: '10.1093/nar/gkab123',
  },
  paper_link: {
    title: 'Link da Publicação',
    category: 'Referência Bibliográfica',
    description: 'URL direta para o artigo científico na revista ou repositório oficial.',
  },
  paper_title: {
    title: 'Título do Artigo',
    category: 'Referência Bibliográfica',
    description: 'Título completo do artigo científico que identificou ou caracterizou o sORF.',
  },
  paper_citation: {
    title: 'Citação do Artigo',
    category: 'Referência Bibliográfica',
    description: 'Citação bibliográfica formatada da publicação científica correspondente.',
  },
  source: {
    title: 'Fonte da Informação',
    category: 'Origem dos Dados',
    description: 'Repositório, banco de dados ou trabalho primário de proveniência.',
  },
  data_source: {
    title: 'Fonte Primária de Dados',
    category: 'Origem dos Dados',
    description: 'Pipeline experimental ou base bioinformática que originou os registros.',
  },
  anotation_score: {
    title: 'Score de Anotação',
    category: 'Qualidade & Confiança',
    description: 'Índice de confiabilidade atribuído à identificação e tradução do sORF.',
  },

  // Condições e Patologias (quando aplicável)
  disease: {
    title: 'Condição / Estresse / Fenótipo',
    category: 'Fenótipo & Fisiologia',
    description: 'Condição fenotípica, resposta a estresse biótico/abiótico ou patologia vegetal associada.',
  },
  disease_original: {
    title: 'Condição Original',
    category: 'Fenótipo & Fisiologia',
    description: 'Descrição literal da condição registrada no trabalho original.',
  },
  disease_subtype: {
    title: 'Subtipo da Condição',
    category: 'Fenótipo & Fisiologia',
    description: 'Detalhes ou estágio específico do estresse vegetal ou fenótipo.',
  },
  age: {
    title: 'Idade / Estágio de Desenvolvimento',
    category: 'Fisiologia Vegetal',
    description: 'Estágio ontogenético da planta durante a coleta da amostra (ex.: 14 dias após germinação).',
    example: 'Plântula 14 dias, Planta adulta',
  },

  // Métricas de Ribo-seq / RiboCrypt
  pif_hbp: {
    title: 'PIF (HBP)',
    category: 'Métricas Ribo-seq',
    description: 'Percentage of In-Frame reads no pipeline HBP, medindo a proporção de leituras ribossômicas alinhadas na fase correta de leitura da tradução.',
  },
  cif_hbp: {
    title: 'CIF (HBP)',
    category: 'Métricas Ribo-seq',
    description: 'Coverage of In-Frame reads no pipeline HBP.',
  },
  dropoff_hbp: {
    title: 'Drop-off (HBP)',
    category: 'Métricas Ribo-seq',
    description: 'Taxa de decaimento de densidade de ribossomos ao longo do ORF no pipeline HBP.',
  },
  pif_ribocrypt: {
    title: 'PIF (RiboCrypt)',
    category: 'Métricas Ribo-seq',
    description: 'Percentage of In-Frame reads no pipeline RiboCrypt, indicativo da periodicidade de 3 nucleotídeos característica de tradução ativa.',
  },
  cif_ribocrypt: {
    title: 'CIF (RiboCrypt)',
    category: 'Métricas Ribo-seq',
    description: 'Coverage of In-Frame reads no pipeline RiboCrypt.',
  },
  dropoff_ribocrypt: {
    title: 'Drop-off (RiboCrypt)',
    category: 'Métricas Ribo-seq',
    description: 'Taxa de queda ou término da tradução estimada pelo RiboCrypt.',
  },

  // Colunas Especiais de Controle da Interface
  status: {
    title: 'Status Comparativo',
    category: 'Controle de Comparação',
    description: 'Indica a correspondência da chave entre a Curadoria Manual e a IA: presente em ambos os braços, apenas na anotação manual ou apenas na extração automática por IA.',
    example: 'Ambos, Apenas Manual, Apenas IA',
  },
  '#': {
    title: 'Índice da Linha',
    category: 'Navegação',
    description: 'Posição sequencial do sORF na ordenação e paginação atuais da tabela.',
  },
  acoes: {
    title: 'Ações do Registro',
    category: 'Navegação',
    description: 'Abre a ficha de detalhes com todos os 55+ campos de metadados deste sORF para inspeção completa.',
  },
  acao: {
    title: 'Ação do Registro',
    category: 'Navegação',
    description: 'Abre a ficha de detalhes com comparação campo a campo entre Manual e IA.',
  },
};

/**
 * Normaliza qualquer nome de coluna para localizar sua definição correspondente.
 */
export function getColumnDefinition(rawColumnName: string): ColumnDefinition {
  const cleanKey = rawColumnName
    .toLowerCase()
    .trim()
    .replace(/[^\w#]/g, '');

  if (COLUMN_DEFINITIONS[cleanKey]) {
    return COLUMN_DEFINITIONS[cleanKey];
  }

  // Tenta correspondência parcial ou fallback elegante
  const matchedKey = Object.keys(COLUMN_DEFINITIONS).find((k) =>
    cleanKey.includes(k) || k.includes(cleanKey)
  );

  if (matchedKey) {
    return COLUMN_DEFINITIONS[matchedKey];
  }

  return {
    title: rawColumnName.toUpperCase(),
    category: 'Metadados de sORF',
    description: `Campo de metadados '${rawColumnName}' extraído das anotações de pequenos ORFs (sORFs) em plantas.`,
  };
}
