# ESPECIFICACAO TÉCNICA E FUNCIONAL - LUNASOLAR PWA

**Aplicativo:** LunaSolar - Posição, Fases e Incidência Solar em Tempo Real  
**Tipo:** Progressive Web App (PWA) / Full-Stack Node.js (TypeScript)  
**Persistência:** Client-side State & Storage (Sem necessidade de Banco de Dados)  
**Idioma:** Português (pt-BR)  

---

## 1. Visão Geral do Aplicativo

O **LunaSolar** é uma aplicação web astronômica em tempo real projetada para calcular, visualizar e simular as posições do Sol e da Lua, as fases lunares, a iluminação da superfície lunar, as sombras na Terra e na Lua, além dos ângulos de incidência solar. 

O aplicativo opera como um **Progressive Web App (PWA)**, permitindo instalação direta na tela inicial de dispositivos móveis e desktops, com suporte a carregamento offline e geolocalização.

---

## 2. Arquitetura e Tecnologias Utilizadas

### 2.1. Backend & Runtime
* **Node.js + Express**: Servidor HTTP para rotas estáticas, suporte ao Vite em modo de desenvolvimento e APIs auxiliares (ex: geocodificação via OpenStreetMap Nominatim e consultas de efemérides).
* **TypeScript**: Tipagem estática em toda a base de código backend e frontend.
* **esbuild**: Empacotamento do servidor para um arquivo CommonJS standalone (`dist/server.cjs`) em produção.

### 2.2. Frontend & Renderização
* **React 19 + Vite**: Framework reativo de alta performance.
* **Three.js**: Renderização 3D WebGL da esfera lunar, textura procedural de crateras, iluminação vetorial direcional simulando raios solares e vetores de incidência.
* **Leaflet**: Renderização de mapa interativo mundial com camada escura (CartoDB Dark Matter), polígonos da sombra noturna solar e zona de visibilidade da Lua.
* **Canvas 2D HTML5**: Renderizador bidimensional da fase lunar com gradiente de iluminação e crateras.
* **Tailwind CSS 4**: Estilização responsiva em tema escuro (Dark Theme) focado em usabilidade noturna e legibilidade.
* **Lucide React**: Biblioteca de ícones vetoriais.

### 2.3. Motores de Cálculo Astronômico
* **Astronomy Engine (`astronomy-engine`)**: Algoritmos de alta precisão orbital (Meeus / VSOP87) para cálculo de coordenadas equatoriais (RA/Dec), horizontais (Azimute/Altitude), vetores heliocêntricos/geocêntricos, pontos sub-solares/sub-lunares e libração.
* **SunCalc (`suncalc`)**: Cálculo de horários locais de nascer/pôr do Sol e da Lua, fração de iluminação e ângulo do limbo iluminado.

---

## 3. Funcionalidades Detalhadas

### 3.1. Controle de Tempo & Simulação
* **Tempo Real (Ao Vivo)**: Atualização contínua a cada segundo com relógio astronômico sincronizado.
* **Controle de Velocidade**: Simulação acelerada nas velocidades 1x (Real), 60x (1 min/s), 3.600x (1 hora/s) e 86.400x (1 dia/s).
* **Navegação Temporal**: Possibilidade de pausar a simulação, retroceder ou avançar para qualquer data/hora histórica ou futura.
* **Seletor de Localização**: Detecção automática de coordenadas via GPS (HTML5 Geolocation) ou busca manual por nome de cidade/país com integração à API Nominatim.

---

### 3.2. Painel Principal (Dashboard)
1. **Renderizador 2D da Fase Lunar**:
   * Desenho procedural dinâmico do disco lunar.
   * Cálculo exato do terminador (curva de transição dia/noite) baseado na fração e ângulo de fase.
   * Indicação percentual de iluminação solar.
2. **Radar de Céu Local (Horizontal Sky Radar)**:
   * Mostrador polar 2D representando a abóbada celeste local.
   * Posicionamento topocêntrico do Sol e da Lua no plano de Azimute ($0^\circ$ a $360^\circ$) e Altitude ($-90^\circ$ a $+90^\circ$).
   * Indicação de zênite ($90^\circ$) e horizonte ($0^\circ$).
3. **Métricas Rápidas**:
   * Distância atual da Lua em km e raios terrestres.
   * Distância atual do Sol em milhões de km e Unidades Astronômicas (UA).
   * Coordenadas geográficas dos pontos Sub-Solar e Sub-Lunar (Zênite na Terra).
   * Ângulo de incidência solar no centro do disco lunar.
4. **Horários Horizontais & Fases**:
   * Tabela com horário de nascer e pôr do Sol e da Lua para a posição do observador.
   * Cronograma das 4 próximas grandes fases lunares (Nova, Quarto Crescente, Cheia, Quarto Minguante).

---

### 3.3. Tela de Visualização Gráfica 3D (Luz Solar & Ângulos Lunares)
1. **Modelo 3D da Lua**:
   * Esfera WebGL texturizada com crateras e mares lunares.
   * Iluminação direcional vetorial posicionada conforme o ângulo de fase real do momento.
2. **Vetores Astronômicos**:
   * Vetor de luz solar incidente.
   * Linha de visão da Terra (vetor observador).
   * Alternância para exibição/ocultação de vetores em cena.
3. **Câmeras & Perspectivas Interativas**:
   * **Visão da Terra**: Perspectiva idêntica à observada a partir da superfície terrestre.
   * **Visão Superior (Espacial)**: Vista do polo eclíptico norte, evidenciando a geometria Sol-Terra-Lua.
   * **Visão do Sol**: Ângulo a partir da fonte de iluminação (Lua 100% iluminada).
   * **Órbita Livre**: Rotação contínua e interativa da esfera lunar.
4. **Simulador e Tabela de Ângulos de Incidência**:
   * Slider interativo para testar qualquer Ângulo de Fase ($\psi$) entre $0^\circ$ (Lua Cheia) e $180^\circ$ (Lua Nova).
   * Ângulo de Fase ($\psi$), Elongação Solar, Ângulo de Incidência no Centro do Disco, Ponto Sub-Solar Lunar (Lat/Lon), Ponto Sub-Terrestre e Longitude do Terminador.

---

### 3.4. Mapa Interativo de Visibilidade Global
1. **Camada de Sombra Solar (Noite Terrestre)**:
   * Cálculo da curva do terminador solar sobre a Terra.
   * Sobreposição de polígono de penumbra/noite cobrindo o hemisfério não iluminado.
2. **Marcadores de Zênite**:
   * **Sub-Solar**: Ponto onde o Sol está a $90^\circ$ (exatamente acima da cabeça).
   * **Sub-Lunar**: Ponto onde a Lua está a $90^\circ$.
   * **Observador**: Localização atual selecionada.
3. **Região de Visibilidade da Lua**:
   * Polígono translúcido destacando em tempo real os países e continentes onde a Lua está acima do horizonte ($Alt > 0^\circ$).
4. **Interatividade por Clique**:
   * Seleção instantânea de novo observador clicando em qualquer ponto do mapa mundi.

---

### 3.5. Calendário & Efemérides Lunares
* **Grade Mensal**: Visualização de todos os dias do mês selecionado.
* **Efemérides Diárias**: Percentual de iluminação, nome da fase e ícone indicativo para cada dia.
* **Indicadores de Fase Principal**: Destaque visual para os dias de transição de fase.
* **Seleção de Data**: Clique em qualquer dia para transportar a simulação do aplicativo para a data escolhida.

---

### 3.6. Guia Educativo de Física Astronômica
* **Explicações Teóricas**:
  1. Conceito do Ângulo de Fase ($\psi$) e sua relação com a iluminação do disco.
  2. O Terminador Lunar e o sombreamento das crateras.
  3. Rotação Síncrona e o fenômeno de Libração.
  4. Diferenças na orientação visual das fases entre o Hemisfério Sul (formato "C" na crescente) e Hemisfério Norte (formato "D").

---

### 3.7. Recursos de Progressive Web App (PWA)
* **`manifest.json`**: Configurações de nome, tema (`#090d16`), cor de fundo, modo `standalone` e ícones.
* **Service Worker (`sw.js`)**: Cache dos ativos estáticos e fallback para uso offline.
* **Instalação PWA**: Botão dinâmico no cabeçalho acionado via evento `beforeinstallprompt`.

---

## 4. Estrutura de Arquivos do Projeto

```
/
├── package.json                   # Dependências e scripts de build/start
├── tsconfig.json                  # Configurações do compilador TypeScript
├── vite.config.ts                 # Configuração do Vite (React e Tailwind)
├── metadata.json                  # Metadados do aplicativo e permissões
├── server.ts                      # Servidor Express com APIs de geocodificação e efemérides
├── index.html                     # HTML principal com meta tags PWA
├── ESPECIFICACAO.md               # Este documento de especificação técnica
├── public/
│   ├── manifest.json              # Manifesto PWA
│   ├── sw.js                      # Service Worker para suporte offline
│   └── icon.svg                   # Ícone vetorial do aplicativo
└── src/
    ├── main.tsx                   # Ponto de entrada do React e registro do Service Worker
    ├── App.tsx                    # Componente raiz, controle de estado do tempo e navegação
    ├── index.css                  # Estilos globais e Tailwind CSS
    ├── types.ts                   # Definições de interfaces e tipos TypeScript
    ├── utils/
    │   └── astronomy.ts           # Funções de cálculo orbital, posições e ângulos solares/lunares
    └── components/
        ├── Header.tsx             # Cabeçalho, controle de tempo, seletor de local e PWA
        ├── Dashboard.tsx          # Painel principal com métricas e resumo
        ├── Moon2DView.tsx         # Renderizador 2D da Lua em Canvas HTML5
        ├── SkyRadar.tsx           # Radar 2D de altitude/azimute do céu local
        ├── LunarLighting3D.tsx    # Visualizador 3D de luz solar e ângulos em Three.js
        ├── GlobalVisibilityMap.tsx # Mapa Leaflet de sombras e visibilidade global
        ├── AstroCalendar.tsx      # Calendário mensal de fases lunares
        └── AstroGuide.tsx         # Guia educativo de física astronômica
```

---

## 5. Instruções de Execução e Build

### Modo Desenvolvimento
```bash
npm run dev
```
Inicia o servidor Express em `http://localhost:3000` executando `server.ts` via `tsx` e integrando os middlewares do Vite.

### Compilação de Produção
```bash
npm run build
```
1. Compila o frontend React/Vite para a pasta `dist/`.
2. Empacota o servidor `server.ts` em `dist/server.cjs` via `esbuild`.

### Execução de Produção
```bash
npm start
```
Executa o servidor compilado `node dist/server.cjs` na porta `3000`.

---

**Desenvolvido com foco em precisão científica, design responsivo e experiência imersiva PWA.**
