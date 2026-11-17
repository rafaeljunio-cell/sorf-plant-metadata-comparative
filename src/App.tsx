import { useState, useEffect, useMemo } from 'react';
import { SorfRecord, SourceType, AlignedComparisonRow, FieldAgreement, ArticleAgreement, MetricRecord } from './types/sorf';
import { fetchAndParseSorfCsv, fetchAndParseMetrics } from './utils/csvParser';
import { alignComparisonRecords, calculateFieldAgreements, calculateArticleAgreements } from './utils/comparator';
import { Header } from './components/Header';
import { DataTable } from './components/DataTable';
import { CompareView } from './components/CompareView';
import { DetailModal } from './components/DetailModal';
import { SummaryDashboard } from './components/SummaryDashboard';
import { AboutPage } from './components/AboutPage';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  // Estado da Fonte selecionada (?fonte=manual|ia|comparar)
  const [source, setSource] = useState<SourceType>(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('fonte')?.toLowerCase();
    if (f === 'manual' || f === 'ia' || f === 'comparar') return f as SourceType;
    return 'manual';
  });

  // Aba ativa (Tabela/Diff, Resumo, Sobre)
  const [activeTab, setActiveTab] = useState<'table' | 'summary' | 'about'>('table');

  // Dados carregados dos CSVs
  const [manualData, setManualData] = useState<SorfRecord[]>([]);
  const [iaData, setIaData] = useState<SorfRecord[]>([]);
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Registro selecionado para o Modal de Detalhes
  const [selectedRecord, setSelectedRecord] = useState<SorfRecord | undefined>();
  const [selectedIaRecord, setSelectedIaRecord] = useState<SorfRecord | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailComparisonStatus, setDetailComparisonStatus] = useState<'both' | 'manual_only' | 'ia_only'>('both');

  // Colunas padrão
  const defaultColumns = useMemo(() => [
    'artigo',
    'original_orf_id',
    'orf_type',
    'Chr',
    'Start',
    'End',
    'Strand',
    'aa_orf_length',
    'aa_orf_sequence',
    'evidence',
    'tissue_or_cell',
  ], []);

  // Lista dinâmica de todas as colunas
  const allColumns = useMemo(() => {
    const set = new Set<string>();
    manualData.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
    iaData.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
    return Array.from(set).filter((c) => c !== 'chave');
  }, [manualData, iaData]);

  // Sincronizar escolha da fonte com a URL (?fonte=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('fonte', source);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [source]);

  // Carregar dados dos CSVs estáticos
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        const [manualRes, iaRes, metricsRes] = await Promise.all([
          fetchAndParseSorfCsv(`${baseUrl}/data/manual.csv`),
          fetchAndParseSorfCsv(`${baseUrl}/data/ia.csv`),
          fetchAndParseMetrics(`${baseUrl}/data/metricas.csv`),
        ]);

        if (manualRes.length === 0 && iaRes.length === 0) {
          setErrorMsg('Nenhum dado encontrado nos arquivos /data/manual.csv ou /data/ia.csv.');
        } else {
          setManualData(manualRes);
          setIaData(iaRes);
          setMetrics(metricsRes);
        }
      } catch (err: any) {
        setErrorMsg(`Erro ao inicializar dados dos CSVs: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Alinhamento comparativo calculado dinamicamente
  const alignedRows: AlignedComparisonRow[] = useMemo(() => {
    if (manualData.length === 0 && iaData.length === 0) return [];
    return alignComparisonRecords(manualData, iaData, allColumns);
  }, [manualData, iaData, allColumns]);

  // Métricas de concordância calculadas dinamicamente
  const fieldAgreements: FieldAgreement[] = useMemo(() => {
    return calculateFieldAgreements(alignedRows, allColumns);
  }, [alignedRows, allColumns]);

  const articleAgreements: ArticleAgreement[] = useMemo(() => {
    return calculateArticleAgreements(alignedRows);
  }, [alignedRows]);

  const handleOpenDetailSingle = (rec: SorfRecord) => {
    setSelectedRecord(rec);
    setSelectedIaRecord(undefined);
    setDetailComparisonStatus('both');
    setIsDetailOpen(true);
  };

  const handleOpenDetailComparison = (row: AlignedComparisonRow) => {
    setSelectedRecord(row.manualRecord);
    setSelectedIaRecord(row.iaRecord);
    setDetailComparisonStatus(row.status);
    setIsDetailOpen(true);
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      
      {/* Header com Interruptor Manual | IA | Comparar */}
      <Header
        source={source}
        onSourceChange={setSource}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        manualCount={manualData.length}
        iaCount={iaData.length}
      />

      {/* Conteúdo Principal que ocupa 100% da altura restante sem barra de rolagem externa */}
      <main className="flex-1 min-h-0 w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-2 overflow-hidden flex flex-col">
        
        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-medium">Carregando dados biológicos (PapaParse)...</span>
          </div>
        )}

        {/* Estado de Erro */}
        {!isLoading && errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-3 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Telas Principais */}
        {!isLoading && !errorMsg && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            
            {/* Aba 1: Tabela de Dados e Modo Comparar */}
            {activeTab === 'table' && (
              <div className="h-full min-h-0 flex flex-col overflow-hidden">
                {source === 'manual' && (
                  <div className="h-full min-h-0 border-t-4 border-blue-600 rounded-xl overflow-hidden shadow-xs flex flex-col">
                    <DataTable
                      data={manualData}
                      sourceName="Manual (Referência)"
                      sourceColor="blue"
                      allColumns={allColumns}
                      defaultColumns={defaultColumns}
                      onSelectRecord={handleOpenDetailSingle}
                    />
                  </div>
                )}

                {source === 'ia' && (
                  <div className="h-full min-h-0 border-t-4 border-orange-600 rounded-xl overflow-hidden shadow-xs flex flex-col">
                    <DataTable
                      data={iaData}
                      sourceName="Inteligência Artificial (Extração Automática)"
                      sourceColor="orange"
                      allColumns={allColumns}
                      defaultColumns={defaultColumns}
                      onSelectRecord={handleOpenDetailSingle}
                    />
                  </div>
                )}

                {source === 'comparar' && (
                  <div className="h-full min-h-0 border-t-4 border-emerald-600 rounded-xl overflow-hidden shadow-xs flex flex-col">
                    <CompareView
                      alignedRows={alignedRows}
                      allColumns={allColumns}
                      defaultColumns={defaultColumns}
                      onSelectComparison={handleOpenDetailComparison}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Aba 2: Painel de Resumo */}
            {activeTab === 'summary' && (
              <div className="h-full min-h-0 overflow-y-auto pr-1">
                <SummaryDashboard
                  manualData={manualData}
                  iaData={iaData}
                  alignedRows={alignedRows}
                  fieldAgreements={fieldAgreements}
                  articleAgreements={articleAgreements}
                  metrics={metrics}
                />
              </div>
            )}

            {/* Aba 3: Página Sobre */}
            {activeTab === 'about' && (
              <div className="h-full min-h-0 overflow-y-auto pr-1">
                <AboutPage />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Modal de Detalhe Completo do sORF */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        record={selectedRecord}
        iaRecord={selectedIaRecord}
        isComparisonMode={source === 'comparar'}
        status={detailComparisonStatus}
      />

    </div>
  );
}
