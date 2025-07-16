// Monaco worker configuration for Bun dev server
// Bundlers (like Bun) will turn the ?worker imports into dedicated worker files.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    switch (label) {
      case 'json':
        return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker?worker', import.meta.url), { type: 'module' })
      case 'css':
      case 'scss':
      case 'less':
        return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker?worker', import.meta.url), { type: 'module' })
      case 'html':
      case 'handlebars':
      case 'razor':
        return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker?worker', import.meta.url), { type: 'module' })
      case 'typescript':
      case 'javascript':
        return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker?worker', import.meta.url), { type: 'module' })
      default:
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker?worker', import.meta.url), { type: 'module' })
    }
  },
}
