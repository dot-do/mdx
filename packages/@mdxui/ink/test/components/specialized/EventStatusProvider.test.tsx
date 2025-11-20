import test from 'ava'
import React from 'react'
import { EventStatusProvider, useEventStatus } from '../../../src/components/specialized/EventStatusProvider.js'

test('EventStatusProvider component should create JSX element', (t) => {
  const element = (
    <EventStatusProvider>
      <div>test</div>
    </EventStatusProvider>
  )
  t.truthy(element)
  t.is(element.type, EventStatusProvider)
})

test('EventStatusProvider should accept children prop', (t) => {
  const children = <div>Test children</div>
  const element = <EventStatusProvider>{children}</EventStatusProvider>
  t.truthy(element.props.children)
})

test('EventStatusProvider should accept onEventUpdate prop', (t) => {
  const onEventUpdate = () => {}
  const element = (
    <EventStatusProvider onEventUpdate={onEventUpdate}>
      <div>test</div>
    </EventStatusProvider>
  )
  t.is(element.props.onEventUpdate, onEventUpdate)
})
