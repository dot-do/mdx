import test from 'ava'
import React from 'react'
import { EventProgressIndicator } from '../../../src/components/specialized/EventProgressIndicator.js'

test('EventProgressIndicator component should create JSX element', (t) => {
  const element = <EventProgressIndicator current={0} total={10} />
  t.truthy(element)
  t.is(element.type, EventProgressIndicator)
  t.is(element.props.current, 0)
  t.is(element.props.total, 10)
})

test('EventProgressIndicator should accept current and total props', (t) => {
  const element = <EventProgressIndicator current={5} total={10} />
  t.is(element.props.current, 5)
  t.is(element.props.total, 10)
})

test('EventProgressIndicator should accept width prop', (t) => {
  const element = <EventProgressIndicator current={5} total={10} width={20} />
  t.is(element.props.width, 20)
})

test('EventProgressIndicator should handle 100% progress', (t) => {
  const element = <EventProgressIndicator current={10} total={10} />
  t.is(element.props.current, 10)
  t.is(element.props.total, 10)
})

test('EventProgressIndicator should handle progress greater than 100%', (t) => {
  const element = <EventProgressIndicator current={15} total={10} />
  t.is(element.props.current, 15)
  t.is(element.props.total, 10)
})
