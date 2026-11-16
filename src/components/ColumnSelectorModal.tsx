import React, { useState } from 'react';
import { X, Search, CheckSquare, Square, RotateCcw } from 'lucide-react';

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allColumns: string[];
  visibleColumns: string[];
  defaultColumns: string[];
  onToggleColumn: (col: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onResetDefault: () => void;
}

export const ColumnSelectorModal: React.FC<ColumnSelectorModalProps> = ({
  isOpen,
  onClose,
  allColumns,
  visibleColumns,
  onToggleColumn,
  onSelectAll,
  onDeselectAll,
  onResetDefault,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredCols = allColumns.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Gerenciar Colunas da Tabela</h3>
            <p className="text-xs text-slate-500">
              Selecione quais das 55+ colunas da tabela_completa deseja exibir
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar coluna..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Todas ({allColumns.length})
            </button>
            <button
              onClick={onDeselectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Square className="w-3.5 h-3.5" />
              Nenhuma
            </button>
            <button
              onClick={onResetDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition border border-emerald-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Padrão
            </button>
          </div>
        </div>

        {/* Column Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50/50">
          {filteredCols.map((col) => {
            const isChecked = visibleColumns.includes(col);
            return (
              <label
                key={col}
                className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                  isChecked
                    ? 'bg-white border-emerald-300 text-emerald-950 font-medium shadow-xs'
                    : 'bg-white/40 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleColumn(col)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4 cursor-pointer"
                />
                <span className="truncate">{col}</span>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>{visibleColumns.length} de {allColumns.length} colunas ativas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
