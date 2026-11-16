import React, { useState, useMemo, useRef } from 'react';
import { AlignedComparisonRow } from '../types/sorf';
import { Search, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface CompareViewProps {
  alignedRows: AlignedComparisonRow[];
  allColumns: string[];
  defaultColumns: string[];
  onSelectComparison: (row: AlignedComparisonRow) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  alignedRows,
  defaultColumns,
  onSelectComparison,
}) => {
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 40;

  // Sincronização de rolagem
  const manualTableRef = useRef<HTMLDivElement>(null);
  const iaTableRef = useRef<HTMLDivElement>(null);

  const syncScroll = (source: 'manual' | 'ia') => {
    if (source === 'manual' && manualTableRef.current && iaTableRef.current) {
      iaTableRef.current.scrollTop = manualTableRef.current.scrollTop;
      iaTableRef.current.scrollLeft = manualTableRef.current.scrollLeft;
    } else if (source === 'ia' && manualTableRef.current && iaTableRef.current) {
      manualTableRef.current.scrollTop = iaTableRef.current.scrollTop;
      manualTableRef.current.scrollLeft = iaTableRef.current.scrollLeft;
    }
  };

  // Colunas prioritárias de comparação
  const compareColumns = useMemo(() => {
    return defaultColumns.filter((c) => c !== 'chave');
  }, [defaultColumns]);

  // Filtros
  const filteredRows = useMemo(() => {
    return alignedRows.filter((row) => {
      if (onlyDifferences && !row.hasDivergence) return false;
      if (selectedArticle !== 'ALL' && row.artigo !== selectedArticle) return false;
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesKey = row.chave.toLowerCase().includes(q);
        const matchesId =
          row.manualRecord?.original_orf_id?.toLowerCase().includes(q) ||
          row.iaRecord?.original_orf_id?.toLowerCase().includes(q);
        const matchesGene =
          row.manualRecord?.gene_id?.toLowerCase().includes(q) ||
          row.iaRecord?.gene_id?.toLowerCase().includes(q);
        if (!matchesKey && !matchesId && !matchesGene) return false;
      }
      return true;
    });
  }, [alignedRows, onlyDifferences, selectedArticle, statusFilter, searchTerm]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Estatísticas Rápidas
  const totalBoth = alignedRows.filter((r) => r.status === 'both').length;
  const totalDivergent = alignedRows.filter((r) => r.hasDivergence).length;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
      
      {/* Barra de Controles do Modo Comparar (Prompt 5) */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar chave de pareamento, ID, gene..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Filtros e Toggle "Mostrar só divergências" */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Toggle de Divergências */}
            <label className="flex items-center gap-2 cursor-pointer bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-800 shadow-xs hover:bg-red-100 transition">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => {
                  setOnlyDifferences(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500 cursor-pointer"
              />
              <span>Mostrar só divergências</span>
              <span className="bg-red-200 text-red-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {totalDivergent}
              </span>
            </label>

            {/* Artigo */}
            <select
              value={selectedArticle}
              onChange={(e) => {
                setSelectedArticle(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="ALL">Todos os Artigos</option>
              <option value="P1">Artigo P1</option>
              <option value="P2">Artigo P2</option>
              <option value="P3">Artigo P3</option>
              <option value="P4">Artigo P4</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="ALL">Todos os Status</option>
              <option value="both">Presente em Ambos ({totalBoth})</option>
              <option value="manual_only">Apenas no Manual</option>
              <option value="ia_only">Apenas na IA</option>
            </select>

          </div>

        </div>

        {/* Status de Alinhamento */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-4">
            <span>Alinhamento por <strong>chave composta</strong> (Chr + Start + End + Strand):</span>
            <span className="font-semibold text-slate-800">{filteredRows.length} pares alinhados</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {alignedRows.length - totalDivergent} idênticos
            </span>
            <span className="text-red-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {totalDivergent} divergentes
            </span>
          </div>
          <div>
            Página <span className="font-semibold text-slate-800">{currentPage}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
        </div>

      </div>

      {/* Visão Dividida: Manual (Esquerda) vs IA (Direita) com Rolagem Sincronizada (Prompt 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[550px] bg-slate-50">
        
        {/* Painel Esquerdo: Braço MANUAL (Azul) */}
        <div className="flex flex-col overflow-hidden bg-white">
          <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>Braço Manual (Referência)</span>
            </div>
            <span className="text-[10px] bg-blue-800/80 px-2 py-0.5 rounded font-mono">
              manual.csv
            </span>
          </div>

          <div
            ref={manualTableRef}
            onScroll={() => syncScroll('manual')}
            className="overflow-x-auto overflow-y-auto max-h-[620px]"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-50/70 text-slate-700 border-b border-blue-200 uppercase tracking-wider text-[11px] font-semibold sticky top-0 bg-white z-10">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Chave</th>
                  {compareColumns.map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                  ))}
                  <th className="py-2.5 px-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {paginatedRows.map((row) => {
                  const m = row.manualRecord;
                  if (!m) {
                    return (
                      <tr key={row.chave} className="bg-slate-100/60 text-slate-400 italic">
                        <td className="py-2 px-3 whitespace-nowrap font-sans font-semibold text-orange-700">
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-[10px]">Ausente</span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">{row.chave}</td>
                        <td colSpan={compareColumns.length + 1} className="py-2 px-3 font-sans text-center text-slate-400">
                          (sORF extraído apenas pelo braço IA)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={row.chave}
                      onClick={() => onSelectComparison(row)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'both' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.status === 'both' ? 'Ambos' : 'Só Manual'}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-800" title={row.chave}>
                        {row.chave.length > 25 ? `${row.chave.substring(0, 22)}...` : row.chave}
                      </td>
                      {compareColumns.map((col) => {
                        const isDiff = row.divergentFields.includes(col);
                        const val = m[col];
                        const isNa = val === undefined || val === null || val === '' || String(val).toUpperCase() === 'NA';
                        return (
                          <td
                            key={col}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isDiff
                                ? 'bg-red-100/80 text-red-950 font-bold border-l-2 border-red-500'
                                : 'text-slate-700'
                            }`}
                          >
                            {isNa ? <span className="text-slate-400 italic font-sans text-[10px]">NA</span> : String(val)}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComparison(row);
                          }}
                          className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          title="Inspecionar pareamento completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel Direito: Braço IA (Laranja) */}
        <div className="flex flex-col overflow-hidden bg-white">
          <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>Braço IA (Extração Automatizada)</span>
            </div>
            <span className="text-[10px] bg-orange-800/80 px-2 py-0.5 rounded font-mono">
              ia.csv
            </span>
          </div>

          <div
            ref={iaTableRef}
            onScroll={() => syncScroll('ia')}
            className="overflow-x-auto overflow-y-auto max-h-[620px]"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-orange-50/70 text-slate-700 border-b border-orange-200 uppercase tracking-wider text-[11px] font-semibold sticky top-0 bg-white z-10">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Chave</th>
                  {compareColumns.map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                  ))}
                  <th className="py-2.5 px-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {paginatedRows.map((row) => {
                  const ia = row.iaRecord;
                  if (!ia) {
                    return (
                      <tr key={row.chave} className="bg-slate-100/60 text-slate-400 italic">
                        <td className="py-2 px-3 whitespace-nowrap font-sans font-semibold text-blue-700">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-[10px]">Ausente</span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">{row.chave}</td>
                        <td colSpan={compareColumns.length + 1} className="py-2 px-3 font-sans text-center text-slate-400">
                          (sORF anotado apenas no braço Manual)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={row.chave}
                      onClick={() => onSelectComparison(row)}
                      className="hover:bg-orange-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'both' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {row.status === 'both' ? 'Ambos' : 'Só IA'}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-800" title={row.chave}>
                        {row.chave.length > 25 ? `${row.chave.substring(0, 22)}...` : row.chave}
                      </td>
                      {compareColumns.map((col) => {
                        const isDiff = row.divergentFields.includes(col);
                        const val = ia[col];
                        const isNa = val === undefined || val === null || val === '' || String(val).toUpperCase() === 'NA';
                        return (
                          <td
                            key={col}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isDiff
                                ? 'bg-red-100/80 text-red-950 font-bold border-l-2 border-red-500'
                                : 'text-slate-700'
                            }`}
                          >
                            {isNa ? <span className="text-slate-400 italic font-sans text-[10px]">NA</span> : String(val)}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComparison(row);
                          }}
                          className="p-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
                          title="Inspecionar pareamento completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Paginação */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <div className="text-slate-500">
          Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
          {Math.min(currentPage * pageSize, filteredRows.length)} de {filteredRows.length} pares alinhados
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-300 rounded">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

    </div>
  );
};
