/**
 * The plugin's whole stylesheet, as one plain CSS string the Client entry
 * injects into `<head>`.
 *
 * Every rule is namespaced under the `dts-` prefix and every colour comes from
 * a host theme token (`--dsw-alias-*`), so the surfaces follow the active
 * harness theme without shipping a palette. Two structural rules are
 * load-bearing:
 *
 * - `.dts-layer{pointer-events:none}` + `.dts-card{pointer-events:auto}`: the
 *   bedtime card must not steal clicks from the app behind it, so only the card
 *   itself is interactive.
 * - `.dts-chip-wrap{position:relative}`: the chip popover anchors above the pill.
 * @module
 */

/** The complete stylesheet, injected by the Client entry and removed with it. */
export const UI_STYLES: string = [
  // ---- composer-dock chip -------------------------------------------------
  '.dts-chip-wrap{position:relative;display:inline-flex;align-items:center;min-width:0;max-width:100%}',
  '.dts-chip{display:inline-flex;flex:0 0 auto;align-items:center;gap:6px;box-sizing:border-box;',
  'max-width:100%;padding:4px 8px;border:0;border-radius:999px;background:transparent;',
  'color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:13px;',
  'white-space:nowrap;cursor:pointer}',
  '.dts-chip:hover,.dts-chip[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover)}',
  '.dts-chip__icon{display:block;flex:none}',
  '.dts-chip__label{overflow:hidden;text-overflow:ellipsis}',
  '.dts-chip__sep{color:var(--dsw-alias-label-tertiary)}',
  // ---- chip popover -------------------------------------------------------
  '.dts-pop{position:absolute;left:0;bottom:calc(100% + 8px);z-index:1200;box-sizing:border-box;',
  'width:248px;max-width:80vw;padding:12px;border-radius:var(--dsw-radius-md);',
  'background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);',
  'border:0.5px solid var(--dsw-alias-border-l2);box-shadow:0 12px 28px rgba(0,0,0,.24);',
  'display:flex;flex-direction:column;gap:6px;text-align:left;font-size:12px;line-height:1.5}',
  '.dts-pop__title{margin:0;font-size:13px;line-height:20px;font-weight:600;color:var(--dsw-alias-label-primary)}',
  '.dts-pop__line{color:var(--dsw-alias-label-secondary)}',
  '.dts-pop__hint{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}',
  // ---- bedtime card -------------------------------------------------------
  '.dts-layer{position:fixed;inset:0;z-index:2147483000;box-sizing:border-box;display:flex;',
  'align-items:flex-end;justify-content:flex-end;padding:24px;pointer-events:none}',
  '.dts-layer--scrim{background:var(--dsw-alias-bg-mask-1)}',
  '.dts-card{pointer-events:auto;box-sizing:border-box;width:360px;max-width:100%;padding:18px;',
  'border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-overlay);',
  'color:var(--dsw-alias-label-primary);border:0.5px solid var(--dsw-alias-border-l2);',
  'box-shadow:0 18px 44px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:10px;',
  'font-size:13px;line-height:1.5}',
  '.dts-card__head{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary)}',
  '.dts-card__icon{display:block;flex:none}',
  '.dts-card__title{margin:0;font-size:16px;line-height:1.3;font-weight:600;color:var(--dsw-alias-label-primary)}',
  '.dts-card__body{margin:0;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-secondary)}',
  '.dts-card__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}',
  // ---- settings row -------------------------------------------------------
  '.dts-row{display:flex;flex-direction:column;gap:8px;padding:16px 0;box-sizing:border-box;',
  'border-bottom:0.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);',
  'font-size:13px;line-height:1.5}',
  '.dts-row__title{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary)}',
  '.dts-section{display:flex;flex-direction:column;gap:8px}',
  '.dts-rowhead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}',
  '.dts-rowhead__text{display:flex;flex-direction:column;gap:2px;min-width:0}',
  '.dts-rowtitle{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary)}',
  '.dts-fields{display:flex;flex-wrap:wrap;gap:12px}',
  '.dts-field{display:flex;flex-direction:column;gap:4px;min-width:0}',
  '.dts-caption{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
  '.dts-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
  '.dts-hint--warn{color:var(--dsw-alias-state-warn-primary)}',
  '.dts-saved{font-size:12px;line-height:18px;color:var(--dsw-alias-state-success-primary)}',
  '.dts-summary{display:flex;align-items:center;flex-wrap:wrap;gap:6px}',
  '.dts-summary__value{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}',
  '.dts-sep{color:var(--dsw-alias-label-tertiary)}',
  '.dts-footer{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
  // ---- controls -----------------------------------------------------------
  '.dts-input{box-sizing:border-box;width:112px;padding:4px 8px;border-radius:var(--dsw-radius-sm);',
  'border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);',
  'color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px}',
  '.dts-input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
  '.dts-input--number{width:72px}',
  '.dts-input--select{width:auto;min-width:200px;max-width:100%}',
  '.dts-toggle{display:flex;align-items:center;gap:8px}',
  '.dts-switch{position:relative;flex:none;box-sizing:border-box;width:34px;height:20px;padding:0;',
  'border:1px solid var(--dsw-alias-border-l2);border-radius:999px;cursor:pointer;font:inherit;',
  'background:var(--dsw-alias-bg-layer-2);transition:background .15s ease}',
  '.dts-switch[aria-checked="true"]{background:var(--dsw-alias-button-primary-fill);border-color:transparent}',
  '.dts-switch__knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;',
  'background:var(--dsw-alias-label-secondary);transition:transform .15s ease,background .15s ease}',
  '.dts-switch[aria-checked="true"] .dts-switch__knob{transform:translateX(14px);',
  'background:var(--dsw-alias-label-primary-inverted)}',
  '.dts-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;',
  'padding:6px 12px;border:1px solid transparent;border-radius:var(--dsw-radius-sm);background:transparent;',
  'color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:12px;line-height:18px}',
  '.dts-btn--primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted)}',
  '.dts-btn--primary:hover{opacity:.9}',
  '.dts-btn--ghost{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}',
  '.dts-btn--ghost:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover)}',
  '.dts-btn--link{padding:6px 4px;color:var(--dsw-alias-label-secondary)}',
  '.dts-btn--link:hover{color:var(--dsw-alias-label-primary)}',
  '@media (prefers-reduced-motion: reduce){.dts-switch,.dts-switch__knob{transition:none}}',
].join('')
