# schema.org.ai

TypeScript types for **schema.org.ai** - AI-native vocabulary for the semantic web.

## Installation

```bash
npm install schema.org.ai
# or
pnpm add schema.org.ai
# or
yarn add schema.org.ai
```

## Usage

### Import Types

```typescript
import type { Agent, Model, Tool, Task } from 'schema.org.ai'
```

### Define an AI Agent

```typescript
import { Agent, SCHEMA_ORG_AI_CONTEXT } from 'schema.org.ai'

const agent: Agent = {
  '@context': SCHEMA_ORG_AI_CONTEXT,
  '@type': 'Agent',
  '@id': 'https://example.com/agents/support',
  name: 'Customer Support Agent',
  role: 'customer-support',
  capabilities: ['answer-questions', 'troubleshoot-issues'],
  model: 'claude-3-5-sonnet-20241022',
  systemPrompt: 'You are a helpful customer support agent.',
  temperature: 0.3,
  autonomyLevel: 'semi-autonomous',
  humanInTheLoop: true
}
```

### Define an AI Model

```typescript
import { Model, MODELS_CONTEXT } from 'schema.org.ai'

const model: Model = {
  '@context': MODELS_CONTEXT,
  '@type': 'Model',
  '@id': 'https://example.com/models/gpt-4',
  name: 'GPT-4',
  modelType: 'llm',
  modelFamily: 'GPT',
  provider: { '@type': 'Organization', name: 'OpenAI' },
  contextWindowSize: 128000,
  functionCalling: true,
  structuredOutput: true,
  costPerInputToken: 0.01,
  costPerOutputToken: 0.03
}
```

### Define a Workflow

```typescript
import { Plan, Task, WORKFLOWS_CONTEXT } from 'schema.org.ai'

const workflow: Plan = {
  '@context': WORKFLOWS_CONTEXT,
  '@type': 'Plan',
  '@id': 'https://example.com/workflows/content-creation',
  name: 'Content Creation Pipeline',
  planType: 'sequential',
  objective: 'Create blog post',
  steps: [
    {
      '@type': 'Task',
      name: 'Research',
      taskType: 'analysis',
      assignedTo: 'research-agent'
    },
    {
      '@type': 'Task',
      name: 'Write Draft',
      taskType: 'generation',
      assignedTo: 'writer-agent'
    },
    {
      '@type': 'Task',
      name: 'Review',
      taskType: 'analysis',
      assignedTo: 'editor-agent'
    }
  ]
}
```

### Type Guards

```typescript
import { isAgent, isModel, isTool } from 'schema.org.ai'

function processEntity(entity: unknown) {
  if (isAgent(entity)) {
    console.log(`Agent role: ${entity.role}`)
  } else if (isModel(entity)) {
    console.log(`Model type: ${entity.modelType}`)
  } else if (isTool(entity)) {
    console.log(`Tool type: ${entity.toolType}`)
  }
}
```

## Available Types

### Core AI-Native Types (17)

- `Agent` - Autonomous AI entity
- `AgentTeam` - Coordinated team of agents
- `Skill` - Specific capability
- `Policy` - Governing rule
- `Model` - AI/ML model
- `Embedding` - Vector embedding model
- `FineTuning` - Model fine-tuning process
- `Tool` - Invocable function/API
- `Task` - Unit of work
- `Plan` - Sequence of tasks
- `KnowledgeBase` - Knowledge collection
- `Prompt` - AI interaction template
- `PromptChain` - Prompt sequence
- `Memory` - Stored knowledge
- `Context` - Environmental info
- `Conversation` - Message thread
- `Message` - Single message

### Schema.org Extensions (21)

- `AIApplication` - AI-powered app
- `AIService` - AI API service
- `AICapability` - AI capability
- `GeneratedWork` - AI-generated content (base)
- `GeneratedArticle` - AI-generated article
- `GeneratedCode` - AI-generated code
- `GeneratedImage` - AI-generated image
- `GeneratedVideo` - AI-generated video
- `GeneratedAudio` - AI-generated audio
- `AgenticAction` - Agent action
- `AIWorkflow` - Multi-step process
- `AIExperiment` - Research experiment
- `AIDeployment` - Model deployment
- `AIMonitoring` - Production monitoring
- `TrainingDataset` - Training data
- `ValidationDataset` - Validation data
- `BenchmarkDataset` - Benchmark data
- `AIModelCard` - Model documentation
- `AIEvaluation` - Performance evaluation
- `AIBenchmark` - Benchmark test
- `AIMetric` - Performance metric

## JSON-LD Context URLs

```typescript
import {
  SCHEMA_ORG_AI_CONTEXT,  // Master context
  AGENTS_CONTEXT,          // Agent types
  MODELS_CONTEXT,          // Model types
  TOOLS_CONTEXT,           // Tool types
  MEMORY_CONTEXT,          // Memory types
  WORKFLOWS_CONTEXT,       // Workflow types
  KNOWLEDGE_CONTEXT        // Knowledge types
} from 'schema.org.ai'
```

## TypeScript Configuration

This package provides full TypeScript support with:

- ✅ Strict type checking
- ✅ IntelliSense autocomplete
- ✅ Type guards for runtime validation
- ✅ Full JSDoc documentation
- ✅ ESM module support

## Resources

- **Website**: [schema.org.ai](https://schema.org.ai)
- **Specification**: [schema.org.ai/spec](https://schema.org.ai/spec)
- **Examples**: [schema.org.ai/examples](https://schema.org.ai/examples)
- **GitHub**: [github.com/mdxld/mdxld](https://github.com/mdxld/mdxld)

## License

MIT
