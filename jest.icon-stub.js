/* Tests don't render icons: every `XxxIcon` export from a per-icon Phosphor file becomes a no-op component. */
module.exports = new Proxy({}, { get: (_target, name) => (name === '__esModule' ? false : () => null) });
