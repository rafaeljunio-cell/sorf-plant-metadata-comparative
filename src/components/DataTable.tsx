import React, { useState, useMemo } from 'react';
import { SorfRecord } from '../types/sorf';
import { ColumnSelectorModal } from './ColumnSelectorModal';
import {
  Search,
  Columns,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface DataTableProps {
  data: SorfRecord[];
  sourceName: string;
  sourceColor: 'blue' | 'orange';
  allColumns: string[];
  defaultColumns: string[];
  onSelectRecord: (record: SorfRecord) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  sourceName,
  sourceColor,
  allColumns,
  defaultColumns,
  onSelectRecord,
}) => {
  // Estado de Colunas Visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);
  const [isColModalOpen, setIsColModalOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState('ALL');

  // Ordenação
  const [sortColumn, setSortColumn] = useState<string>('chave');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Paginação (Prompt 3: 50 linhas por página)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Feedback de Cópia
  const [copiedSeq, setCopiedSeq] = useState<string | null>(null);

  // Listas para Filtros Select
  const availableArticles = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.artigo).filter(Boolean))).sort();
  }, [data]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.orf_type).filter(Boolean))).sort();
  }, [data]);

  const availableEvidences = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.evidence).filter(Boolean))).sort();
  }, [data]);

  // Aplicação dos Filtros
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Artigo
      if (selectedArticle !== 'ALL' && row.artigo !== selectedArticle) {
        return false;
      }
      // Tipo
      if (selectedType !== 'ALL' && row.orf_type !== selectedType) {
        return false;
      }
      // Evidência
      if (selectedEvidence !== 'ALL' && row.evidence !== selectedEvidence) {
        return false;
      }
      // Busca Livre
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesChave = row.chave?.toLowerCase().includes(query);
        const matchesId = row.original_orf_id?.toLowerCase().includes(query) || row.orf_id?.toLowerCase().includes(query);
        const matchesGene = row.gene_id?.toLowerCase().includes(query) || row.gene_name?.toLowerCase().includes(query);
        const matchesSeq = row.aa_orf_sequence?.toLowerCase().includes(query) || row.nt_orf_sequence?.toLowerCase().includes(query);
        const matchesChr = row.Chr?.toString().toLowerCase().includes(query);
        if (!matchesChave && !matchesId && !matchesGene && !matchesSeq && !matchesChr) {
          return false;
        }
      }
      return true;
    });
  }, [data, selectedArticle, selectedType, selectedEvidence, searchTerm]);

  // Ordenação
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortColumn] ?? '';
      const valB = b[sortColumn] ?? '';
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedSeq(text);
    setTimeout(() => setCopiedSeq(null), 2000);
  };

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Barra de Filtros e Ferramentas (Prompt 1 & 3) */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Busca Livre */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por ID, gene, sequência, Chr..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Filtros em Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Artigo */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-xs">
              <span className="text-slate-400 mr-1.5 font-medium">Artigo:</span>
              <select
                value={selectedArticle}
                onChange={(e) => {
                  setSelectedArticle(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">Todos ({availableArticles.length})</option>
                {availableArticles.map((art) => (
                  <option key={art} value={art}>{art}</option>
                ))}
              </select>
            </div>

            {/* Tipo de sORF */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-xs">
              <span className="text-slate-400 mr-1.5 font-medium">Tipo:</span>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">Todos</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Evidência */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-xs">
              <span className="text-slate-400 mr-1.5 font-medium">Evidência:</span>
              <select
                value={selectedEvidence}
                onChange={(e) => {
                  setSelectedEvidence(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">Todas</option>
                {availableEvidences.map((ev) => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
            </div>

            {/* Botão de Colunas */}
            <button
              onClick={() => setIsColModalOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg shadow-xs transition"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              <span>Colunas ({visibleColumns.length})</span>
            </button>

          </div>

        </div>

        {/* Resumo da consulta */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${sourceColor === 'blue' ? 'bg-blue-600' : 'bg-orange-600'}`} />
            <span>Exibindo fonte <strong>{sourceName}</strong>:</span>
            <span className="font-semibold text-slate-800">{sortedData.length}</span> sORFs encontrados
            {filteredData.length !== data.length && (
              <span className="text-slate-400">(filtrados de {data.length})</span>
            )}
          </div>
          <div>
            Página <span className="font-semibold text-slate-800">{currentPage}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
        </div>

      </div>

      {/* Tabela de Dados com Rolagem Horizontal (Prompt 3) */}
      <div className="overflow-x-auto min-h-[450px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 uppercase tracking-wider font-semibold select-none">
              <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
              {visibleColumns.map((col) => {
                const isSorting = sortColumn === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      {isSorting ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-emerald-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="py-2.5 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="py-12 text-center text-slate-400 font-medium"
                >
                  Nenhum sORF corresponde aos filtros selecionados.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row.chave || idx}
                    onClick={() => onSelectRecord(row)}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 text-[10px] font-mono">
                      {rowNum}
                    </td>
                    {visibleColumns.map((col) => {
                      const val = row[col];
                      const isNa = val === undefined || val === null || val === '' || String(val).toUpperCase() === 'NA';

                      // Tratamento especial para Sequência de Aminoácidos
                      if (col === 'aa_orf_sequence' && !isNa) {
                        const seq = String(val);
                        const truncated = seq.length > 18 ? `${seq.substring(0, 15)}...` : seq;
                        const isCopied = copiedSeq === seq;
                        return (
                          <td key={col} className="py-2 px-3 whitespace-nowrap font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span title={seq} className="text-emerald-950 font-medium">
                                {truncated}
                              </span>
                              <button
                                onClick={(e) => handleCopy(seq, e)}
                                title="Copiar sequência completa"
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        );
                      }

                      // Badge para Artigo
                      if (col === 'artigo') {
                        return (
                          <td key={col} className="py-2 px-3 whitespace-nowrap font-semibold">
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px]">
                              {String(val)}
                            </span>
                          </td>
                        );
                      }

                      // Badge para orf_type
                      if (col === 'orf_type') {
                        return (
                          <td key={col} className="py-2 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium text-[10px]">
                              {String(val)}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col}
                          className={`py-2 px-3 whitespace-nowrap max-w-xs truncate ${
                            isNa ? 'text-slate-400 italic text-[11px]' : 'text-slate-800'
                          }`}
                          title={!isNa ? String(val) : undefined}
                        >
                          {isNa ? 'NA' : String(val)}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(row);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition"
                      >
                        <Eye className="w-3 h-3" />
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação (Prompt 3: 50 por página) */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <div className="text-slate-500">
          Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} registros
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

      {/* Modal de Gerenciamento de Colunas */}
      <ColumnSelectorModal
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        defaultColumns={defaultColumns}
        onToggleColumn={toggleColumn}
        onSelectAll={() => setVisibleColumns([...allColumns])}
        onDeselectAll={() => setVisibleColumns([])}
        onResetDefault={() => setVisibleColumns([...defaultColumns])}
      />

    </div>
  );
};
