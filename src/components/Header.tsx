import React from 'react';
import { SourceType } from '../types/sorf';
import { Dna, BarChart3, Table2, Info } from 'lucide-react';

interface HeaderProps {
  source: SourceType;
  onSourceChange: (newSource: SourceType) => void;
  activeTab: 'table' | 'summary' | 'about';
  onTabChange: (tab: 'table' | 'summary' | 'about') => void;
  manualCount: number;
  iaCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  source,
  onSourceChange,
  activeTab,
  onTabChange,
  manualCount,
  iaCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-4">
          
          {/* Logo e Título */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('table')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Dna className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  sORF Plant Metadata <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60 uppercase">Manual vs IA</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Portal comparativo de anotação de pequenos ORFs em plantas · Inspirado no PsORF Database
              </p>
            </div>
          </div>

          {/* Interruptor Central (Prompt 2 & 5: Manual | IA | Comparar) */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => {
                onSourceChange('manual');
                if (activeTab !== 'table') onTabChange('table');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                source === 'manual'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${source === 'manual' ? 'bg-white' : 'bg-blue-500'}`} />
              Manual
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-black/30 font-normal">
                {manualCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSourceChange('ia');
                if (activeTab !== 'table') onTabChange('table');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                source === 'ia'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${source === 'ia' ? 'bg-white' : 'bg-orange-500'}`} />
              IA
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-black/30 font-normal">
                {iaCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSourceChange('comparar');
                if (activeTab !== 'table') onTabChange('table');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                source === 'comparar'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${source === 'comparar' ? 'bg-white' : 'bg-emerald-500'}`} />
              Comparar
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-black/30 font-normal">
                Diff
              </span>
            </button>
          </div>

          {/* Navegação entre Visões */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-4">
            <button
              onClick={() => onTabChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span>Dados / Diff</span>
            </button>

            <button
              onClick={() => onTabChange('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Resumo</span>
            </button>

            <button
              onClick={() => onTabChange('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Sobre</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
