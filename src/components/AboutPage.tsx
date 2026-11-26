import React from 'react';
import { BookOpen, Layers, ExternalLink, Dna } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const articles = [
    {
      id: 'P1',
      title: 'Genome-Wide Identification and Characterization of Small Peptides in Maize',
      citation: 'Liang et al., Front. Plant Sci. 12:695439 (2021)',
      doi: '10.3389/fpls.2021.695439',
      species: 'Zea mays (Milho)',
      volume: '10.150 sORFs identificados',
    },
    {
      id: 'P2',
      title: 'The Tomato Translational Landscape Revealed by Transcriptome Assembly and Ribosome Profiling',
      citation: 'Wu et al., Plant Physiol. 181(1):367-380 (2019)',
      doi: '10.1104/pp.19.00541',
      species: 'Solanum lycopersicum (Tomate)',
      volume: '1.532 sORFs identificados',
    },
    {
      id: 'P3',
      title: 'The multiomics landscape of small peptides encoded by long non-coding RNA-derived sORFs in rice',
      citation: 'Chen et al., bioRxiv (2025)',
      doi: '10.1101/2025.04.01.646714',
      species: 'Oryza sativa (Arroz)',
      volume: '366 sORFs identificados',
    },
    {
      id: 'P4',
      title: 'Improved Super-Resolution Ribosome Profiling Reveals Prevalent Translation of Upstream ORFs and Small ORFs in Arabidopsis',
      citation: 'Wu et al., Plant Cell (2024)',
      doi: '10.1093/plcell/koad290',
      species: 'Arabidopsis thaliana',
      volume: '7.559 sORFs identificados',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Hero / Apresentação */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
          <Dna className="w-4 h-4" />
          <span>Projeto de Pesquisa Científica</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          Validação e Anotação Comparativa de sORFs em Plantas: Extração Manual vs Inteligência Artificial
        </h2>
        <p className="text-slate-600 leading-relaxed text-sm">
          Este portal foi desenvolvido como ferramenta analítica e visual para comparar rigorosamente
          a extração de metadados biológicos de pequenos quadros de leitura aberta (sORFs) realizada por
          especialistas humanos (anotação manual) contra pipelines automatizados baseados em modelos de linguagem
          e Inteligência Artificial (LLMs).
        </p>
      </div>

      {/* Protocolo em Duas Fases (Prompt 7) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Protocolo Metodológico em Duas Fases
          </h3>
          <p className="text-xs text-slate-500">
            Fluxo experimental estruturado para garantir reprodutibilidade e neutralidade científica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Fase 1 */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Fase 1: Extração e Curadoria Manual</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curadores humanos especialistas leram na íntegra os 4 artigos científicos e seus respectivos materiais
              suplementares (tabelas S1–S12), preenchendo rigorosamente as 55 variáveis da <code className="text-blue-900 font-mono bg-blue-100 px-1 py-0.5 rounded">tabela_completa</code>.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Validação de coordenadas genômicas (Chr, Start, End, Strand)</li>
              <li>Aferição de evidências de tradução (Ribo-seq, espectrometria de massa)</li>
              <li>Registro de tempos de preenchimento por artigo</li>
            </ul>
          </div>

          {/* Fase 2 */}
          <div className="p-5 rounded-xl border border-orange-200 bg-orange-50/50 space-y-3">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Fase 2: Extração por Inteligência Artificial</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pipeline estruturado com prompts especializados alimentado pelos PDFs e tabelas suplementares
              para extrair os mesmos 55 campos biológicos em formato tabular padronizado.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Extração semântica e estruturação em JSON/CSV</li>
              <li>Geração da chave composta de pareamento canônico</li>
              <li>Auditoria por juiz cego para desempate e avaliação de alucinações</li>
            </ul>
          </div>

        </div>

        {/* A Chave de Pareamento */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <span className="font-bold text-slate-800 block">Estratégia de Pareamento (Coluna Chave):</span>
          <p>
            Para possibilitar a comparação campo a campo sem falsos desencontros de linhas, foi definida uma chave determinística:
          </p>
          <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg">
            chave = artigo + "_" + Chr + "_" + Start + "_" + End + "_" + Strand
          </div>
          <p className="text-slate-500 italic">
            Quando não há coordenadas explícitas, a chave recorre a <code className="font-mono">artigo + "_" + original_orf_id</code>.
          </p>
        </div>

      </div>

      {/* Os 4 Artigos Analisados (Prompt 7) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Artigos Analisados no Estudo (P1 a P4)
          </h3>
          <p className="text-xs text-slate-500">
            Publicações de alto impacto selecionadas para o benchmark comparativo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => (
            <div key={art.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                  {art.id}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {art.species}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-snug">
                {art.title}
              </h4>
              <p className="text-[11px] text-slate-500">{art.citation}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-600">{art.volume}</span>
                <a
                  href={`https://doi.org/${art.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <span>DOI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Créditos e Equipe (Prompt 7) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Equipe de Desenvolvimento e Pesquisa</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            <strong>Rafael Junio Alves</strong> · Universidade Tecnológica Federal do Paraná (UTFPR)
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Bioinformática & Engenharia de Software Aplicada à Genômica Vegetal
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Versão 1.0.0 (Produção)
          </span>
        </div>
      </div>

    </div>
  );
};
