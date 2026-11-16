import React from 'react';
import {
  SorfRecord,
  AlignedComparisonRow,
  FieldAgreement,
  ArticleAgreement,
  MetricRecord,
} from '../types/sorf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  Dna,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  FileCheck2,
} from 'lucide-react';

interface SummaryDashboardProps {
  manualData: SorfRecord[];
  iaData: SorfRecord[];
  alignedRows: AlignedComparisonRow[];
  fieldAgreements: FieldAgreement[];
  articleAgreements: ArticleAgreement[];
  metrics: MetricRecord[];
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  manualData,
  iaData,
  alignedRows,
  fieldAgreements,
  articleAgreements,
  metrics,
}) => {
  // Totais
  const totalBoth = alignedRows.filter((r) => r.status === 'both').length;
  const totalManualOnly = alignedRows.filter((r) => r.status === 'manual_only').length;
  const totalIaOnly = alignedRows.filter((r) => r.status === 'ia_only').length;
  const totalChaves = alignedRows.length;

  const overlapPct = totalChaves > 0 ? ((totalBoth / totalChaves) * 100).toFixed(1) : '0';

  // Métricas agregadas
  const manualMetrics = metrics.filter((m) => m.braco === 'manual');
  const iaMetrics = metrics.filter((m) => m.braco === 'ia');

  const totalTimeManual = manualMetrics.reduce((acc, m) => acc + m.tempo_min, 0);
  const totalTimeIa = iaMetrics.reduce((acc, m) => acc + m.tempo_min, 0);
  const timeReductionPct = totalTimeManual > 0
    ? (((totalTimeManual - totalTimeIa) / totalTimeManual) * 100).toFixed(0)
    : '0';

  const avgJudgeManual = manualMetrics.length > 0
    ? (manualMetrics.reduce((acc, m) => acc + m.acerto_juiz, 0) / manualMetrics.length * 100).toFixed(1)
    : null;
  const avgJudgeIa = iaMetrics.length > 0
    ? (iaMetrics.reduce((acc, m) => acc + m.acerto_juiz, 0) / iaMetrics.length * 100).toFixed(1)
    : null;

  // Formatação para gráfico de artigos
  const articleChartData = articleAgreements.map((a) => ({
    artigo: a.artigo,
    'Presente em Ambos': a.inBoth,
    'Apenas Manual': a.manualOnly,
    'Apenas IA': a.iaOnly,
    concordanciaGeral: a.overallAgreementPct,
  }));

  // Pega os 18 campos com menor concordância para o gráfico horizontal
  const criticalFields = fieldAgreements.slice(0, 18);

  return (
    <div className="space-y-6">
      
      {/* Cards de Métricas Principais (Prompt 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total sORFs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total de sORFs Coletados
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalChaves}</span>
              <span className="text-xs text-slate-500">chaves únicas</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-blue-700 font-medium">Manual: {manualData.length}</span>
              <span className="text-slate-300">|</span>
              <span className="text-orange-700 font-medium">IA: {iaData.length}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Dna className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Sobreposição / Concordância de Chave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Sobreposição de Chaves
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{overlapPct}%</span>
              <span className="text-xs text-slate-500">({totalBoth} sORFs em ambos)</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-blue-600 font-medium">Só Manual: {totalManualOnly}</span>
              <span className="text-slate-300">|</span>
              <span className="text-orange-600 font-medium">Só IA: {totalIaOnly}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Tempo Gasto (metricas.csv) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Eficiência Temporal
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-900">-{timeReductionPct}%</span>
              <span className="text-xs text-slate-500">tempo total gasto</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-slate-600">Manual: {totalTimeManual} min</span>
              <span className="text-slate-300">|</span>
              <span className="text-orange-700 font-semibold">IA: {totalTimeIa} min</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Avaliação do Juiz */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Acurácia do Juiz Especialista
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {avgJudgeManual ? `${avgJudgeManual}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">Manual vs {avgJudgeIa}% IA</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Delta de precisão: {avgJudgeManual && avgJudgeIa ? `${(Number(avgJudgeManual) - Number(avgJudgeIa)).toFixed(1)}%` : 'N/A'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Gráfico 1: Concordância por Campo (Prompt 6: Barras Horizontais ordenadas asc) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Porcentagem de Concordância por Campo (Campos com Menor Acordo)
            </h3>
            <p className="text-xs text-slate-500">
              Ordenado dos campos mais divergentes para os mais concordantes entre Manual e IA (linhas presentes em ambos)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {totalBoth} pares avaliados campo a campo
          </span>
        </div>

        <div className="h-[480px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={criticalFields}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="field"
                tick={{ fontSize: 11, fill: '#334155' }}
                width={140}
              />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Concordância']}
                labelFormatter={(lbl) => `Campo: ${lbl}`}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="percentage" name="Concordância (%)" radius={[0, 4, 4, 0]}>
                {criticalFields.map((entry, index) => {
                  let fillColor = '#10b981'; // Alta concordância (>85%)
                  if (entry.percentage < 60) fillColor = '#ef4444'; // Crítica (<60%)
                  else if (entry.percentage < 80) fillColor = '#f97316'; // Moderada (60-80%)
                  else if (entry.percentage < 90) fillColor = '#eab308'; // Razoável (80-90%)
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500" />
            <span>Crítico (&lt;60% acordo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500" />
            <span>Moderado (60%–80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-500" />
            <span>Bom (80%–90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Excelente (&gt;90% acordo)</span>
          </div>
        </div>
      </div>

      {/* Gráfico 2 e 3: Concordância por Artigo & Métricas de Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribuição por Artigo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Distribuição de sORFs por Artigo (P1 a P4)
            </h3>
            <p className="text-xs text-slate-500">
              Contagem de registros compartilhados e exclusivos por publicação
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={articleChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="artigo" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Presente em Ambos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Apenas Manual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Apenas IA" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparativo de Tempo Gasto (minutos) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Tempo Gasto na Extração por Artigo (Minutos)
            </h3>
            <p className="text-xs text-slate-500">
              Comparativo direto de esforço humano (Manual) versus tempo de inferência (IA)
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={['P1', 'P2', 'P3', 'P4'].map((art) => {
                  const m = manualMetrics.find((item) => item.artigo === art)?.tempo_min || 0;
                  const i = iaMetrics.find((item) => item.artigo === art)?.tempo_min || 0;
                  return { artigo: art, Manual: m, IA: i };
                })}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="artigo" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" min" />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Manual" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="IA" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
