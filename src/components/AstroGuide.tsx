import React from 'react';
import { Info, Sun, Moon, Sparkles, Compass, Eye, Layers } from 'lucide-react';

export const AstroGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-400" /> Guia de Física Astronômica: Luz Solar e Fases Lunares
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Aprenda como a geometria do sistema Sol-Terra-Lua determina as sombras, a iluminação da superfície lunar e a orientação do limbo iluminado.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Topic 1: Ângulo de Fase */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Sun className="w-4 h-4" /> 1. O Ângulo de Fase ($\psi$)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            O <strong>Ângulo de Fase</strong> é o ângulo formado no centro da Lua entre os vetores direcionados ao <strong>Sol</strong> e à <strong>Terra</strong>. 
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-200">Ângulo de 0° (Lua Cheia):</strong> O Sol está exatamente atrás da Terra em relação à Lua, iluminando 100% do disco visível.</li>
            <li><strong className="text-slate-200">Ângulo de 90° (Quarto):</strong> Metade do disco lunar visível recebe luz direta do Sol.</li>
            <li><strong className="text-slate-200">Ângulo de 180° (Lua Nova):</strong> A luz solar incide no lado oculto da Lua; a face voltada para a Terra permanece no cone de sombra.</li>
          </ul>
        </div>

        {/* Topic 2: Terminador Solar */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Moon className="w-4 h-4" /> 2. O Terminador e a Linha de Sombra
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            O <strong>Terminador Lunar</strong> é a linha divisória entre o dia e a noite na superfície da Lua. Como a Lua não possui atmosfera apreciável para dispersar a luz, a transição entre luz e sombra é abrupta.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            É ao longo do terminador que a luz solar incide em ângulos muito rasos, projetando longas sombras das crateras e montanhas lunares, proporcionando o melhor contraste estrutural para observação com telescópios.
          </p>
        </div>

        {/* Topic 3: Libração Lunar */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Compass className="w-4 h-4" /> 3. Libração e Rotação Síncrona
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A Lua está em <strong>rotação síncrona</strong> com a Terra, significando que seu período de rotação é idêntico ao seu período orbital (~27,3 dias). No entanto, devido à orbita elíptica e inclinação do eixo, a Lua parece oscilar ligeiramente — um fenômeno chamado <strong>Libração</strong>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            A libração em longitude e latitude permite aos observadores na Terra enxergar cerca de <strong>59%</strong> da superfície lunar total ao longo do tempo.
          </p>
        </div>

        {/* Topic 4: Orientação por Hemisfério */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Eye className="w-4 h-4" /> 4. Fases no Hemisfério Sul vs Hemisfério Norte
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A fração iluminada da Lua é a mesma em qualquer ponto do planeta Terra no mesmo instante, porém sua <strong>orientação aparente</strong> no céu muda dependendo do hemisfério do observador:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-emerald-300">Hemisfério Sul:</strong> A Lua Crescente tem formato de "C" e ilumina o lado esquerdo do disco.</li>
            <li><strong className="text-cyan-300">Hemisfério Norte:</strong> A Lua Crescente tem formato de "D" e ilumina o lado direito do disco.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
