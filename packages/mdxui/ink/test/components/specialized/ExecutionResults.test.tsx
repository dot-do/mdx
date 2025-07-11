import test from 'ava'
import React from 'react'
import { ExecutionResults } from '../../../src/components/specialized/ExecutionResults.js'
import type { CodeExecutionResult } from '../../../src/utils/code-execution.js'

test('ExecutionResults component should render with successful results', (t) => {
  const results: CodeExecutionResult[] = [
    {
      success: true,
      output: 'Hello, world!',
    },
  ]

  const element = <ExecutionResults results={results} />
  t.truthy(element)
  t.is(element.type, ExecutionResults)
  t.deepEqual(element.props.results, results)
})

test('ExecutionResults component should render with error results', (t) => {
  const results: CodeExecutionResult[] = [
    {
      success: false,
      error: 'Test error message',
    },
  ]

  const element = <ExecutionResults results={results} />
  t.truthy(element)
  t.is(element.type, ExecutionResults)
  t.deepEqual(element.props.results, results)
})

test('ExecutionResults component should render with empty results', (t) => {
  const results: CodeExecutionResult[] = []
  const element = <ExecutionResults results={results} />
  t.truthy(element)
  t.is(element.type, ExecutionResults)
  t.deepEqual(element.props.results, results)
})

test('ExecutionResults component should render with multiple results', (t) => {
  const results: CodeExecutionResult[] = [
    {
      success: true,
      output: 'First output',
    },
    {
      success: false,
      error: 'Second block error',
    },
    {
      success: true,
      output: 'Third output',
    },
  ]

  const element = <ExecutionResults results={results} />
  t.truthy(element)
  t.is(element.type, ExecutionResults)
  t.deepEqual(element.props.results, results)
})
