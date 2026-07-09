/**
 * Redamind Charts — camada de componentes reutilizáveis em cima do Chart.js.
 *
 * Todos os componentes são standalone, recebem os dados via @Input() e se
 * atualizam sozinhos (com animação suave) sempre que esses inputs mudam —
 * não é preciso recriar o gráfico manualmente. Cores no formato `var(--nome)`
 * são resolvidas automaticamente a partir do tema global do app.
 *
 * `ProgressRingComponent` é a exceção: é um indicador circular simples
 * (SVG puro), não um gráfico de dados, então não passa pelo Chart.js.
 */
export { LineChartComponent } from './line-chart.component';
export { BarChartComponent, type BarChartItem } from './bar-chart.component';
export { MultiLineChartComponent, type ChartSeries } from './multi-line-chart.component';
export { RadarChartComponent, type RadarAxis } from './radar-chart.component';
export { ProgressRingComponent } from './progress-ring.component';
export { DonutChartComponent, type DonutSegment } from './donut-chart.component';
