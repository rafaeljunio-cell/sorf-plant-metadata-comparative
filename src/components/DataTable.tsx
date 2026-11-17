import React, { useState, useMemo } from 'react';
import { SorfRecord } from '../types/sorf';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { ColumnSelectorModal } from './ColumnSelectorModal';

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
  // Colunas Visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);
  const [isColModalOpen, setIsColModalOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<string>('ALL');

  // Ordenação
  const [sortColumn, setSortColumn] = useState<string>('Start');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Feedback de Cópia
  const [copiedSeq, setCopiedSeq] = useState<string | null>(null);

  // Lista de artigos únicos para o filtro
  const availableArticles = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.artigo) set.add(r.artigo);
    });
    return Array.from(set).sort();
  }, [data]);

  // Lista de orf_type únicos
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.orf_type) set.add(r.orf_type);
    });
    return Array.from(set).sort();
  }, [data]);

  // Lista de evidences únicas
  const availableEvidences = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.evidence) set.add(r.evidence);
    });
    return Array.from(set).sort();
  }, [data]);

  // Busca abrangente e normalizada em todos os campos da linha
  const filteredData = useMemo(() => {
    const rawQuery = searchTerm.trim().toLowerCase();
    const cleanQuery = rawQuery.replace(/[-_.\s]/g, '');

    return data.filter((row) => {
      // 1. Filtros por dropdown
      if (selectedArticle !== 'ALL' && row.artigo !== selectedArticle) {
        return false;
      }
      if (selectedType !== 'ALL' && row.orf_type !== selectedType) {
        return false;
      }
      if (selectedEvidence !== 'ALL' && row.evidence !== selectedEvidence) {
        return false;
      }

      // 2. Busca Livre em todos os campos do registro
      if (rawQuery !== '') {
        let matchFound = false;
        for (const val of Object.values(row)) {
          if (val === null || val === undefined) continue;
          const str = String(val).toLowerCase();
          if (str.includes(rawQuery)) {
            matchFound = true;
            break;
          }
          if (cleanQuery && str.replace(/[-_.\s]/g, '').includes(cleanQuery)) {
            matchFound = true;
            break;
          }
        }
        if (!matchFound) return false;
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

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
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
    <div className="h-full min-h-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Barra de Filtros e Ferramentas Compacta */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50/80 space-y-1.5 shrink-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
          
          {/* Busca Livre */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar em qualquer campo (ex: lncRNA-sORF, gene, Chr, seq)..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs placeholder:text-slate-400"
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

          {/* Filtros em Dropdown */}
          <div className="flex flex-wrap items-center gap-1.5">
            
            {/* Artigo */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs">
              <span className="text-slate-400 mr-1 font-medium">Artigo:</span>
              <select
                value={selectedArticle}
                onChange={(e) => {
                  setSelectedArticle(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer py-0.5 text-xs"
              >
                <option value="ALL">Todos ({availableArticles.length})</option>
                {availableArticles.map((art) => (
                  <option key={art} value={art}>{art}</option>
                ))}
              </select>
            </div>

            {/* Tipo de sORF */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs">
              <span className="text-slate-400 mr-1 font-medium">Tipo:</span>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer py-0.5 text-xs"
              >
                <option value="ALL">Todos ({availableTypes.length})</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Evidência */}
            <div className="flex items-center text-xs bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs">
              <span className="text-slate-400 mr-1 font-medium">Evidência:</span>
              <select
                value={selectedEvidence}
                onChange={(e) => {
                  setSelectedEvidence(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer py-0.5 text-xs"
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
              className="flex items-center gap-1 text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg shadow-xs transition"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              <span>Colunas ({visibleColumns.length})</span>
            </button>

          </div>

        </div>

        {/* Resumo da consulta */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${sourceColor === 'blue' ? 'bg-blue-600' : 'bg-orange-600'}`} />
            <span>Exibindo fonte <strong>{sourceName}</strong>:</span>
            <span className="font-semibold text-slate-800">{sortedData.length}</span> sORFs encontrados
            {filteredData.length !== data.length && (
              <span className="text-slate-400 font-normal">(filtrados do total de {data.length})</span>
            )}
          </div>
          <div>
            Página <span className="font-semibold text-slate-800">{currentPage}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
        </div>

      </div>

      {/* Tabela de Dados com Cabeçalho Sticky e Rolagem Interna */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100/95 text-slate-700 border-b border-slate-200 uppercase tracking-wider font-semibold select-none backdrop-blur-xs shadow-xs">
            <tr>
              <th className="py-2 px-3 w-10 text-center text-slate-400">#</th>
              {visibleColumns.map((col) => {
                const isSorting = sortColumn === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
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
              <th className="py-2 px-3 text-center">Ações</th>
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
                    <td className="py-1.5 px-3 text-center text-slate-400 text-[10px] font-mono">
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
                          <td key={col} className="py-1.5 px-3 whitespace-nowrap font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span title={seq} className="text-emerald-950 font-medium">
                                {truncated}
                              </span>
                              <button
                                onClick={(e) => handleCopy(seq, e)}
                                title="Copiar sequência completa"
                                className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
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
                          <td key={col} className="py-1.5 px-3 whitespace-nowrap font-semibold">
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px]">
                              {String(val)}
                            </span>
                          </td>
                        );
                      }

                      // Badge para orf_type
                      if (col === 'orf_type') {
                        return (
                          <td key={col} className="py-1.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium text-[10px]">
                              {String(val)}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col}
                          className={`py-1.5 px-3 whitespace-nowrap max-w-xs truncate ${
                            isNa ? 'text-slate-400 italic text-[11px]' : 'text-slate-800'
                          }`}
                          title={!isNa ? String(val) : undefined}
                        >
                          {isNa ? 'NA' : String(val)}
                        </td>
                      );
                    })}
                    <td className="py-1.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(row);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition"
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

      {/* Paginação Compacta */}
      <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span>
            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} registros
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
