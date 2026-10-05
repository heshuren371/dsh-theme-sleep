let requireFn = null;
/** The shell's React instance, filled by {@link bindPlatform}. */
export const React = {};
/**
 * Bind the factory's module table and load the one module React cannot live
 * without. Called once, at the top of the bundle factory, before `apply`.
 * @param require_ - Module-table `require` supplied by `window.__ModuleLoader__`.
 */
export function bindPlatform(require_) {
    requireFn = require_;
    Object.assign(React, require_('react'));
}
/**
 * Resolve one platform word from the module table.
 * @param specifier - Exact module-table key, for example `react-dom`.
 * @returns The module namespace.
 * @throws When called before {@link bindPlatform}.
 */
export function platformModule(specifier) {
    if (requireFn === null) {
        throw new Error(`@local/dsh-theme-sleep: platform module "${specifier}" requested before the module table was bound`);
    }
    return requireFn(specifier);
}
/**
 * Resolve an optional platform word, tolerating a shell that does not offer it.
 * @param specifier - Exact module-table key.
 * @returns The module namespace, or `null`.
 */
export function optionalPlatformModule(specifier) {
    try {
        return platformModule(specifier);
    }
    catch {
        return null;
    }
}
/**
 * `React.createElement` behind a stable name.
 *
 * The component parameter is deliberately permissive: these components take
 * their own props (the plugin's frozen surface), and every call site supplies
 * the matching object, so the shared renderer's exact prop type would only add
 * noise. React validates nothing here either — it forwards props as given.
 * @param type - Element type: tag name or component.
 * @param props - Element props for that component.
 * @param children - Child nodes.
 * @returns The created element.
 */
export function h(type, props, ...children) {
    return React.createElement(type, (props ?? null), ...children);
}
let portalFn;
/**
 * Render `children` into a layer on `document.body`, the host's convention for
 * a surface that covers the window.
 * @param children - Layer content.
 * @returns The portal element, or `null` when this shell exposes no portal API
 *          (the caller then renders the layer in place).
 */
export function createPortal(children) {
    if (portalFn === undefined) {
        portalFn = optionalPlatformModule('react-dom')?.createPortal ?? null;
    }
    if (portalFn === null || portalFn === undefined)
        return null;
    if (typeof document === 'undefined' || document.body === null)
        return null;
    return portalFn(children, document.body);
}
