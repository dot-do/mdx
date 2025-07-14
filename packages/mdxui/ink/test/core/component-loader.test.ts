import test from 'ava'
import React from 'react'
import { registerComponent, registerComponents, getAllComponents, mergeComponents } from '../../src/component-system/loader.js'

test.beforeEach(() => {
  globalThis.__mdxComponentRegistry = undefined
})

test.afterEach(() => {
  globalThis.__mdxComponentRegistry = undefined
})

test.serial('should register a single component', async (t) => {
  const TestComponent = () => React.createElement('div', null, 'Test')
  registerComponent('test', TestComponent)

  const components = await getAllComponents()
  t.is(components.test, TestComponent)
})

test('should throw an error if component is not a function', (t) => {
  const error = t.throws(() => {
    registerComponent('test', 'not-a-component' as any)
  })
  t.is(error?.message, 'Component for "test" must be a React component function')
})

test.serial('should register multiple components at once', async (t) => {
  const TestComponent1 = () => React.createElement('div', null, 'Test 1')
  const TestComponent2 = () => React.createElement('div', null, 'Test 2')

  registerComponents({
    test1: TestComponent1,
    test2: TestComponent2,
  })

  const components = await getAllComponents()
  t.is(components.test1, TestComponent1)
  t.is(components.test2, TestComponent2)
})

test.serial('should merge file-based and programmatically registered components', async (t) => {
  const ProgrammaticComponent = () => React.createElement('div', null, 'Programmatic')
  registerComponent('programmatic', ProgrammaticComponent)

  const components = await getAllComponents()
  t.is(components.programmatic, ProgrammaticComponent)
})

test('should merge component objects with precedence to overrides', (t) => {
  const DefaultComponent = () => React.createElement('div', null, 'Default')
  const OverrideComponent = () => React.createElement('div', null, 'Override')

  const defaults = {
    test: DefaultComponent,
    unchanged: DefaultComponent,
  }

  const overrides = {
    test: OverrideComponent,
    new: OverrideComponent,
  }

  const result = mergeComponents(defaults, overrides)

  t.is(result.test, OverrideComponent)
  t.is(result.unchanged, DefaultComponent)
  t.is(result.new, OverrideComponent)
})
