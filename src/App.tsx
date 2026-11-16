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
  // Estado da Fonte selecionada (Prompt 2: ?fonte=manual|ia|comparar)
  const [source, setSource] = useState<SourceType>(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('fonte')?.toLowerCase();
    if (f === 'manual' || f === 'ia' || f === 'comparar') return f as SourceType;
    return 'manual';
  });

  // Aba ativa (Tabela/Diff, Resumo, Sobre)
  const [activeTab, setActiveTab] = useState<'table' | 'summary' | 'about'>('summary'); // Abre no Resumo conforme Prompt 7

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

  // Colunas padrão especificadas no Prompt 3
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
        const [manualRes, iaRes, metricsRes] = await Promise.all([
          fetchAndParseSorfCsv('/data/manual.csv'),
          fetchAndParseSorfCsv('/data/ia.csv'),
          fetchAndParseMetrics('/data/metricas.csv'),
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Header com Interruptor Manual | IA | Comparar */}
      <Header
        source={source}
        onSourceChange={setSource}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        manualCount={manualData.length}
        iaCount={iaData.length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <span className="text-sm font-medium">Carregando dados biológicos (PapaParse)...</span>
          </div>
        )}

        {/* Estado de Erro */}
        {!isLoading && errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Telas Principais */}
        {!isLoading && !errorMsg && (
          <>
            {/* Aba 1: Tabela de Dados e Modo Comparar */}
            {activeTab === 'table' && (
              <div>
                {source === 'manual' && (
                  <div className="border-t-4 border-blue-600 rounded-xl overflow-hidden shadow-xs">
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
                  <div className="border-t-4 border-orange-600 rounded-xl overflow-hidden shadow-xs">
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
                  <div className="border-t-4 border-emerald-600 rounded-xl overflow-hidden shadow-xs">
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

            {/* Aba 2: Painel de Resumo (Prompt 6) */}
            {activeTab === 'summary' && (
              <SummaryDashboard
                manualData={manualData}
                iaData={iaData}
                alignedRows={alignedRows}
                fieldAgreements={fieldAgreements}
                articleAgreements={articleAgreements}
                metrics={metrics}
              />
            )}

            {/* Aba 3: Página Sobre (Prompt 7) */}
            {activeTab === 'about' && <AboutPage />}
          </>
        )}

      </main>

      {/* Modal de Detalhe Completo do sORF (Prompt 4) */}
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
