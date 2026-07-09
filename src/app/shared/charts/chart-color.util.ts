/**
 * Utilitários de cor para os gráficos baseados em Chart.js.
 *
 * O <canvas> não entende `var(--minha-cor)` como o CSS entende — o contexto
 * 2D do canvas precisa do valor final (hex/rgb) já resolvido. Por isso,
 * sempre que um componente recebe uma cor como `var(--accent)`, resolvemos
 * o valor real lendo a variável computada do elemento antes de repassar
 * ao Chart.js.
 */

/** Resolve `var(--nome)` para o valor computado real (ex: '#00c4ff'). Strings que já são cores são retornadas como estão. */
export function resolveCssColor(value: string, el: HTMLElement): string {
  const match = value.match(/^var\((--[\w-]+)\)$/);
  if (!match) return value;
  const resolved = getComputedStyle(el).getPropertyValue(match[1]).trim();
  return resolved || '#00c4ff';
}

/** Aplica transparência a uma cor hex ou rgb(a), retornando rgba(). */
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb')) {
    const nums = color.match(/[\d.]+/g);
    if (nums && nums.length >= 3) return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
  }
  return color;
}
