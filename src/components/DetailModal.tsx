import React, { useState } from 'react';
import { SorfRecord, ComparisonStatus } from '../types/sorf';
import { areValuesEqual } from '../utils/comparator';
import { X, Copy, Check, ExternalLink, Dna, MapPin, FileText, Activity, Layers, BookOpen } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: SorfRecord;
  iaRecord?: SorfRecord;
  isComparisonMode?: boolean;
  status?: ComparisonStatus;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  record,
  iaRecord,
  isComparisonMode = false,
  status = 'both',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || (!record && !iaRecord)) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderField = (label: string, fieldKey: string, isMono = false) => {
    const valManual = record ? record[fieldKey] : undefined;
    const valIa = iaRecord ? iaRecord[fieldKey] : undefined;
    const isDivergent = isComparisonMode && record && iaRecord && !areValuesEqual(valManual, valIa);

    const formatVal = (v: any) => {
      if (v === undefined || v === null || v === '' || String(v).toUpperCase() === 'NA') {
        return <span className="text-slate-400 italic font-sans text-xs">NA</span>;
      }
      return String(v);
    };

    if (isComparisonMode && record && iaRecord) {
      return (
        <div className={`p-2.5 rounded-lg border transition-all ${
          isDivergent ? 'bg-red-50/80 border-red-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
            {isDivergent && (
              <span className="text-[10px] font-bold text-red-600 px-1.5 py-0.2 rounded bg-red-100">Divergente</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border-r border-slate-200 pr-2">
              <span className="text-[10px] text-blue-600 font-bold block mb-0.5">MANUAL:</span>
              <div className={`${isMono ? 'font-mono text-[11px] bg-white p-1.5 rounded border border-slate-200 break-all' : 'text-slate-800'}`}>
                {formatVal(valManual)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-orange-600 font-bold block mb-0.5">IA:</span>
              <div className={`${isMono ? 'font-mono text-[11px] bg-white p-1.5 rounded border border-slate-200 break-all' : 'text-slate-800'}`}>
                {formatVal(valIa)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const currentVal = record ? valManual : valIa;
    const isNa = currentVal === undefined || currentVal === null || currentVal === '' || String(currentVal).toUpperCase() === 'NA';

    return (
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
          {label}
        </span>
        <div className={`${isMono ? 'font-mono text-[11px] bg-white p-2 rounded border border-slate-200 break-all' : 'text-xs text-slate-800 font-medium'}`}>
          {isNa ? <span className="text-slate-400 italic font-sans text-xs">NA</span> : String(currentVal)}
        </div>
      </div>
    );
  };

  const primaryRecord = record || iaRecord!;
  const title = primaryRecord.original_orf_id || primaryRecord.orf_name || primaryRecord.chave;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono tracking-tight">{title}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {primaryRecord.artigo}
                </span>
                {isComparisonMode && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    status === 'both' ? 'bg-emerald-900/60 text-emerald-300' :
                    status === 'manual_only' ? 'bg-blue-900/60 text-blue-300' : 'bg-orange-900/60 text-orange-300'
                  }`}>
                    {status === 'both' ? 'Presente em Ambos' : status === 'manual_only' ? 'Apenas Manual' : 'Apenas IA'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Chave: {primaryRecord.chave}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo com Seções (Prompt 4) */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-100/50">
          
          {/* Seção 1: Identificação */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>1. Identificação do sORF</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {renderField('Original ORF ID', 'original_orf_id')}
              {renderField('Original ORF Name', 'original_orf_name')}
              {renderField('ORF Name Padronizado', 'orf_name')}
              {renderField('Tipo (orf_type)', 'orf_type')}
              {renderField('Subtipo (orf_subtype)', 'orf_subtype')}
              {renderField('Idade Evolutiva (age)', 'age')}
              {renderField('Conservação', 'conservation')}
              {renderField('Kozak Context', 'Kozak')}
              {renderField('Signal Peptide', 'signal_peptide')}
            </div>
          </div>

          {/* Seção 2: Coordenadas Genômicas */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Coordenadas Genômicas</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {renderField('Cromossomo', 'Chr')}
              {renderField('Posição Início', 'Start')}
              {renderField('Posição Fim', 'End')}
              {renderField('Fita (Strand)', 'Strand')}
              {renderField('Versão Genoma', 'original_genome_version')}
              {renderField('Anotation Score', 'anotation_score')}
            </div>
          </div>

          {/* Seção 3: Sequências (Prompt 4: Monoespaçado com Cópia) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Dna className="w-4 h-4 text-emerald-600" />
                <span>3. Sequências (Nucleotídeos e Aminoácidos)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                {renderField('Tamanho aa (aa_orf_length)', 'aa_orf_length')}
                {renderField('Tamanho nt (nt_transcript_length)', 'nt_transcript_length')}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Sequência de Aminoácidos (aa_orf_sequence):</span>
                    {primaryRecord.aa_orf_sequence && (
                      <button
                        onClick={() => handleCopy(String(primaryRecord.aa_orf_sequence), 'aa')}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded font-medium"
                      >
                        {copiedKey === 'aa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'aa' ? 'Copiado!' : 'Copiar AA'}
                      </button>
                    )}
                  </div>
                  {renderField('aa_orf_sequence', 'aa_orf_sequence', true)}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Sequência de Nucleotídeos (nt_orf_sequence):</span>
                    {primaryRecord.nt_orf_sequence && (
                      <button
                        onClick={() => handleCopy(String(primaryRecord.nt_orf_sequence), 'nt')}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded font-medium"
                      >
                        {copiedKey === 'nt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'nt' ? 'Copiado!' : 'Copiar NT'}
                      </button>
                    )}
                  </div>
                  {renderField('nt_orf_sequence', 'nt_orf_sequence', true)}
                </div>
              </div>
            </div>
          </div>

          {/* Seção 4: Gene e Transcrito */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>4. Gene e Transcrito Associado</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {renderField('Gene ID', 'gene_id')}
              {renderField('Gene Name', 'gene_name')}
              {renderField('Gene Biotype', 'gene_biotype')}
              {renderField('Transcript ID', 'transcript_id')}
              {renderField('Transcript Name', 'transcript_name')}
              {renderField('Transcript Biotype', 'transcript_biotype')}
              {renderField('All Transcripts', 'all_transcripts')}
              {renderField('All Genes', 'all_genes')}
              {renderField('RNAcentral ID', 'rnacentral_id')}
            </div>
          </div>

          {/* Seção 5: Evidência Experimental e Métricas Ribo-Seq */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>5. Evidência Experimental e Métricas Ribo-Seq</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {renderField('Evidência Principal', 'evidence')}
              {renderField('Evidência Original', 'original_evidence')}
              {renderField('Tecido / Linhagem Celular', 'tissue_or_cell')}
              {renderField('PIF (HBP)', 'pif_hbp')}
              {renderField('CIF (HBP)', 'cif_hbp')}
              {renderField('Dropoff (HBP)', 'dropoff_hbp')}
              {renderField('PIF (RiboCrypt)', 'pif_ribocrypt')}
              {renderField('CIF (RiboCrypt)', 'cif_ribocrypt')}
              {renderField('Dropoff (RiboCrypt)', 'dropoff_ribocrypt')}
              <div className="sm:col-span-2 md:col-span-3">
                {renderField('Informação Funcional', 'functional_information')}
              </div>
            </div>
          </div>

          {/* Seção 6: Artigo e Referência com DOI Clicável */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>6. Artigo de Origem e Publicação</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderField('Título do Artigo', 'paper_title')}
                {renderField('Citação', 'paper_citation')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderField('DOI', 'DOI')}
                {renderField('Fonte de Dados', 'source')}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Link Direto
                  </span>
                  {primaryRecord.paper_link ? (
                    <a
                      href={String(primaryRecord.paper_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold underline truncate"
                    >
                      <span>Abrir Artigo / DOI</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Sem link</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer do Modal */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
