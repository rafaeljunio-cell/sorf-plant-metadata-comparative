import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { getColumnDefinition } from '../utils/columnDefinitions';
import { BookOpen, Sparkles, X } from 'lucide-react';

interface ColumnHeaderWithTooltipProps {
  column: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  delayMs?: number; // Padrão: 4000ms (4 segundos)
}

export const ColumnHeaderWithTooltip: React.FC<ColumnHeaderWithTooltipProps> = ({
  column,
  onClick,
  className = '',
  children,
  delayMs = 4000,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
    placement: 'bottom' | 'top';
  } | null>(null);

  const thRef = useRef<HTMLTableCellElement>(null);
  const timerRef = useRef<number | null>(null);
  const isOverThRef = useRef(false);
  const isOverTooltipRef = useRef(false);

  const def = getColumnDefinition(column);

  const updatePosition = () => {
    if (!thRef.current) return;
    const rect = thRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipEstimatedHeight = 180;
    const margin = 12;

    // Posição horizontal centralizada sob a coluna
    const centerTh = rect.left + rect.width / 2;
    const idealLeft = centerTh - tooltipWidth / 2;
    const boundedLeft = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, idealLeft));
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 16, centerTh - boundedLeft));

    // Posição vertical: prefere abaixo do cabeçalho
    let top = rect.bottom + 8;
    let placement: 'bottom' | 'top' = 'bottom';

    if (top + tooltipEstimatedHeight > window.innerHeight && rect.top > tooltipEstimatedHeight + 20) {
      top = rect.top - tooltipEstimatedHeight - 8;
      placement = 'top';
    }

    setCoords({ top, left: boundedLeft, arrowLeft, placement });
  };

  const handleMouseEnter = () => {
    isOverThRef.current = true;
    setIsPending(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      if (isOverThRef.current) {
        updatePosition();
        setIsOpen(true);
        setIsPending(false);
      }
    }, delayMs);
  };

  const handleMouseLeave = () => {
    isOverThRef.current = false;
    setIsPending(false);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Pequeno atraso para verificar se o mouse entrou no tooltip
    window.setTimeout(() => {
      if (!isOverThRef.current && !isOverTooltipRef.current) {
        setIsOpen(false);
      }
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    isOverTooltipRef.current = true;
  };

  const handleTooltipMouseLeave = () => {
    isOverTooltipRef.current = false;
    window.setTimeout(() => {
      if (!isOverThRef.current && !isOverTooltipRef.current) {
        setIsOpen(false);
      }
    }, 100);
  };

  // Fecha no scroll ou ao pressionar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Limpa o timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <th
      ref={thRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none ${className}`}
    >
      {children || column}

      {/* Barra de progresso sutil no pé da coluna indicando os 4 segundos */}
      {isPending && !isOpen && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-300/40 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-emerald-500 animate-tooltip-fill"
            style={{ animationDuration: `${delayMs}ms` }}
          />
        </div>
      )}

      {/* Tooltip flutuante via Portal no Body */}
      {isOpen && coords && createPortal(
        <div
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: '320px',
            zIndex: 9999,
          }}
          className="bg-slate-900/95 text-white backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150 text-left pointer-events-auto"
        >
          {/* Seta indicadora (Arrow) */}
          <div
            style={{ left: `${coords.arrowLeft}px` }}
            className={`absolute w-3 h-3 bg-slate-900 border-slate-700/80 transform rotate-45 -translate-x-1/2 ${
              coords.placement === 'bottom'
                ? '-top-1.5 border-t border-l'
                : '-bottom-1.5 border-b border-r'
            }`}
          />

          {/* Cabeçalho do Card */}
          <div className="flex items-start justify-between gap-2 mb-1.5 relative">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              {def.category}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
              title="Fechar explicação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Título da Coluna */}
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1.5 font-mono">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{def.title}</span>
            <span className="text-[10px] font-normal text-slate-400 font-sans">({column})</span>
          </h4>

          {/* Descrição Explicativa */}
          <p className="text-[11px] text-slate-200 leading-relaxed font-normal mb-2">
            {def.description}
          </p>

          {/* Exemplos se houver */}
          {def.example && (
            <div className="bg-slate-800/90 rounded-md px-2 py-1.5 border border-slate-700/60 mb-2">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                Exemplos comuns:
              </div>
              <div className="text-[11px] text-emerald-300 font-mono break-all">
                {def.example}
              </div>
            </div>
          )}

          {/* Rodapé informativo */}
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Metadado de sORFs vegetais</span>
            <span className="text-slate-500 font-mono">4s hover</span>
          </div>
        </div>,
        document.body
      )}
    </th>
  );
};
