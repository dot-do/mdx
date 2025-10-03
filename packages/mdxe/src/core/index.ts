/**
 * mdxe Core Module
 *
 * Provides mdxdb integration and Worker Loader capabilities for safe,
 * isolated evaluation of MDX/JS/TS code.
 */

// Database integration
export {
  createDbContext,
  createReadOnlyDbContext,
  type MdxeDbConfig,
  type DbContext,
  type MdxDbInterface,
  type DocumentContent,
  type CollectionInterface,
} from './db.js'

// Worker Loader wrapper
export {
  WorkerLoader,
  createCodeWorker,
  createSecureWorkerConfig,
  type WorkerModule,
  type WorkerConfig,
  type WorkerLoaderBinding,
  type WorkerInstance,
  type WorkerExecutionContext,
  type SecurityOptions,
} from './loader.js'

// MDX evaluation engine
export {
  MdxEvaluator,
  evaluateMdx,
  evaluateTypeScript,
  evaluateJavaScript,
  type EvalResult,
  type MdxEvalOptions,
  type CodeEvalOptions,
} from './eval.js'
