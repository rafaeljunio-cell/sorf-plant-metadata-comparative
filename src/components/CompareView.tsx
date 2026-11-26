import React, { useState, useMemo, useRef, useDeferredValue } from 'react';
import { AlignedComparisonRow } from '../types/sorf';
import { Search, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { ColumnHeaderWithTooltip } from './ColumnHeaderWithTooltip';

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
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedArticle, setSelectedArticle] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
    const rawQuery = deferredSearchTerm.trim().toLowerCase();
    const cleanQuery = rawQuery.replace(/[-_.\s]/g, '');

    return alignedRows.filter((row) => {
      if (onlyDifferences && !row.hasDivergence) return false;
      if (selectedArticle !== 'ALL' && row.artigo !== selectedArticle) return false;
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;

      if (rawQuery !== '') {
        // Busca na Chave
        if (row.chave.toLowerCase().includes(rawQuery)) return true;
        if (cleanQuery && row.chave.toLowerCase().replace(/[-_.\s]/g, '').includes(cleanQuery)) return true;

        // Busca nos campos do Manual
        if (row.manualRecord) {
          for (const val of Object.values(row.manualRecord)) {
            if (val == null) continue;
            const str = String(val).toLowerCase();
            if (str.includes(rawQuery)) return true;
            if (cleanQuery && str.replace(/[-_.\s]/g, '').includes(cleanQuery)) return true;
          }
        }

        // Busca nos campos da IA
        if (row.iaRecord) {
          for (const val of Object.values(row.iaRecord)) {
            if (val == null) continue;
            const str = String(val).toLowerCase();
            if (str.includes(rawQuery)) return true;
            if (cleanQuery && str.replace(/[-_.\s]/g, '').includes(cleanQuery)) return true;
          }
        }

        return false;
      }
      return true;
    });
  }, [alignedRows, onlyDifferences, selectedArticle, statusFilter, deferredSearchTerm]);

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
    <div className="h-full min-h-0 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
      
      {/* Barra de Controles Compacta do Modo Comparar */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50/80 space-y-1.5 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          
          {/* Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por tipo, ID, gene, chave..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filtros e Toggle "Mostrar só divergências" */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Toggle de Divergências */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-800 shadow-xs hover:bg-red-100 transition">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => {
                  setOnlyDifferences(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-3.5 h-3.5 text-red-600 rounded border-red-300 focus:ring-red-500 cursor-pointer"
              />
              <span>Só divergências</span>
              <span className="bg-red-200 text-red-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {totalDivergent}
              </span>
            </label>

            {/* Artigo */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs">
              <span className="text-slate-400 mr-1 font-medium">Artigo:</span>
              <select
                value={selectedArticle}
                onChange={(e) => {
                  setSelectedArticle(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer text-xs py-0.5"
              >
                <option value="ALL">Todos</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>

            {/* Status de Presença */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs">
              <span className="text-slate-400 mr-1 font-medium">Presença:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer text-xs py-0.5"
              >
                <option value="ALL">Todos os sORFs</option>
                <option value="both">Presente em Ambos ({totalBoth})</option>
                <option value="manual_only">Apenas no Manual</option>
                <option value="ia_only">Apenas na IA</option>
              </select>
            </div>

          </div>

        </div>

        {/* Resumo da consulta */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center gap-2">
            <span>Exibindo:</span>
            <span className="font-semibold text-slate-800">{filteredRows.length}</span> pares de anotação
            {filteredRows.length !== alignedRows.length && (
              <span className="text-slate-400 font-normal">(filtrados de {alignedRows.length})</span>
            )}
          </div>
          <div>
            Página <span className="font-semibold text-slate-800">{currentPage}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
        </div>

      </div>

      {/* Visão Dividida Lado a Lado (Prompt 5) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden">
        
        {/* Painel Esquerdo: Anotação Manual (Azul) */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="bg-blue-600/10 px-3 py-1.5 border-b border-blue-200 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Manual (Referência Humana)
            </span>
            <span className="text-[11px] text-blue-700 font-mono">Rolagem Sincronizada</span>
          </div>

          <div
            ref={manualTableRef}
            onScroll={() => syncScroll('manual')}
            className="flex-1 min-h-0 overflow-auto"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100/95 text-slate-700 border-b border-slate-200 uppercase tracking-wider font-semibold select-none backdrop-blur-xs shadow-xs">
                <tr>
                  <ColumnHeaderWithTooltip column="#" className="py-2 px-2.5 w-8 text-center text-slate-400">
                    #
                  </ColumnHeaderWithTooltip>
                  <ColumnHeaderWithTooltip column="Status" className="py-2 px-2.5 whitespace-nowrap">
                    Status
                  </ColumnHeaderWithTooltip>
                  {compareColumns.map((col) => (
                    <ColumnHeaderWithTooltip key={col} column={col} className="py-2 px-2.5 whitespace-nowrap">
                      {col}
                    </ColumnHeaderWithTooltip>
                  ))}
                  <ColumnHeaderWithTooltip column="Ação" className="py-2 px-2.5 text-center">
                    Ação
                  </ColumnHeaderWithTooltip>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={compareColumns.length + 3} className="py-12 text-center text-slate-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1;
                    const rec = row.manualRecord;
                    const isMissing = !rec;
                    const rowKey = row.chave || `row-${idx}`;
                    const isHovered = hoveredKey === rowKey;

                    return (
                      <tr
                        key={rowKey}
                        onClick={() => onSelectComparison(row)}
                        onMouseEnter={() => setHoveredKey(rowKey)}
                        onMouseLeave={() => setHoveredKey(null)}
                        className={`cursor-pointer transition-all duration-150 ${
                          isHovered
                            ? (isMissing ? 'row-light-missing' : 'row-light-blue')
                            : (isMissing ? 'bg-slate-100/50 text-slate-400 italic' : 'text-slate-800')
                        }`}
                      >
                        <td className="py-1.5 px-2.5 text-center text-slate-400 text-[10px] font-mono">
                          {rowNum}
                        </td>
                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                          {isMissing ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium">
                              Ausente
                            </span>
                          ) : row.hasDivergence ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-semibold">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              Diff ({row.divergentFields.length})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Idêntico
                            </span>
                          )}
                        </td>
                        {compareColumns.map((col) => {
                          const val = rec ? rec[col] : '—';
                          const isDiff = row.divergentFields.includes(col);
                          return (
                            <td
                              key={col}
                              className={`py-1.5 px-2.5 whitespace-nowrap max-w-xs truncate transition-colors ${
                                isDiff ? (isHovered ? 'cell-diff-active' : 'bg-amber-100/70 text-amber-950 font-semibold') : ''
                              }`}
                              title={String(val ?? '')}
                            >
                              {val ?? 'NA'}
                            </td>
                          );
                        })}
                        <td className="py-1.5 px-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComparison(row);
                            }}
                            className="p-1 rounded text-blue-600 hover:bg-blue-100 transition"
                            title="Ver detalhes comparativos"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel Direito: Anotação IA (Laranja) */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="bg-orange-600/10 px-3 py-1.5 border-b border-orange-200 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
              IA (Extração Automática)
            </span>
            <span className="text-[11px] text-orange-700 font-mono">Destaque de Divergências</span>
          </div>

          <div
            ref={iaTableRef}
            onScroll={() => syncScroll('ia')}
            className="flex-1 min-h-0 overflow-auto"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100/95 text-slate-700 border-b border-slate-200 uppercase tracking-wider font-semibold select-none backdrop-blur-xs shadow-xs">
                <tr>
                  <ColumnHeaderWithTooltip column="#" className="py-2 px-2.5 w-8 text-center text-slate-400">
                    #
                  </ColumnHeaderWithTooltip>
                  <ColumnHeaderWithTooltip column="Status" className="py-2 px-2.5 whitespace-nowrap">
                    Status
                  </ColumnHeaderWithTooltip>
                  {compareColumns.map((col) => (
                    <ColumnHeaderWithTooltip key={col} column={col} className="py-2 px-2.5 whitespace-nowrap">
                      {col}
                    </ColumnHeaderWithTooltip>
                  ))}
                  <ColumnHeaderWithTooltip column="Ação" className="py-2 px-2.5 text-center">
                    Ação
                  </ColumnHeaderWithTooltip>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={compareColumns.length + 3} className="py-12 text-center text-slate-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1;
                    const rec = row.iaRecord;
                    const isMissing = !rec;
                    const rowKey = row.chave || `row-${idx}`;
                    const isHovered = hoveredKey === rowKey;

                    return (
                      <tr
                        key={rowKey}
                        onClick={() => onSelectComparison(row)}
                        onMouseEnter={() => setHoveredKey(rowKey)}
                        onMouseLeave={() => setHoveredKey(null)}
                        className={`cursor-pointer transition-all duration-150 ${
                          isHovered
                            ? (isMissing ? 'row-light-missing' : 'row-light-orange')
                            : (isMissing ? 'bg-slate-100/50 text-slate-400 italic' : 'text-slate-800')
                        }`}
                      >
                        <td className="py-1.5 px-2.5 text-center text-slate-400 text-[10px] font-mono">
                          {rowNum}
                        </td>
                        <td className="py-1.5 px-2.5 whitespace-nowrap">
                          {isMissing ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium">
                              Ausente
                            </span>
                          ) : row.hasDivergence ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-semibold">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              Diff ({row.divergentFields.length})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Idêntico
                            </span>
                          )}
                        </td>
                        {compareColumns.map((col) => {
                          const val = rec ? rec[col] : '—';
                          const isDiff = row.divergentFields.includes(col);
                          return (
                            <td
                              key={col}
                              className={`py-1.5 px-2.5 whitespace-nowrap max-w-xs truncate transition-colors ${
                                isDiff ? (isHovered ? 'cell-diff-active' : 'bg-amber-100/70 text-amber-950 font-semibold') : ''
                              }`}
                              title={String(val ?? '')}
                            >
                              {val ?? 'NA'}
                            </td>
                          );
                        })}
                        <td className="py-1.5 px-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComparison(row);
                            }}
                            className="p-1 rounded text-orange-600 hover:bg-orange-100 transition"
                            title="Ver detalhes comparativos"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Paginação Compacta */}
      <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span>
            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, filteredRows.length)} de {filteredRows.length} pares
          </span>
          <div className="flex items-center gap-1">
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <span className="px-2.5 py-0.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

    </div>
  );
};
