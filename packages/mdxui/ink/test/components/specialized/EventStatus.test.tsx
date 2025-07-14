import test from 'ava'
import React from 'react'
import { EventStatus } from '../../../src/components/specialized/EventStatus.js'
import type { EventStatusItem } from '../../../src/components/specialized/EventStatusTypes.js'

test('EventStatus component should create JSX element', (t) => {
  const events: EventStatusItem[] = []
  const element = <EventStatus events={events} />
  t.truthy(element)
  t.is(element.type, EventStatus)
  t.deepEqual(element.props.events, [])
})

test('EventStatus should accept events prop', (t) => {
  const events: EventStatusItem[] = [
    {
      id: 'test-event',
      name: 'Test Event',
      status: 'pending',
    },
  ]
  const element = <EventStatus events={events} />
  t.deepEqual(element.props.events, events)
})

test('EventStatus should accept title prop', (t) => {
  const events: EventStatusItem[] = []
  const element = <EventStatus events={events} title='Event Status' />
  t.is(element.props.title, 'Event Status')
})

test('EventStatus should handle events with different statuses', (t) => {
  const events: EventStatusItem[] = [
    {
      id: 'pending-event',
      name: 'Pending Event',
      status: 'pending',
    },
    {
      id: 'running-event',
      name: 'Running Event',
      status: 'running',
    },
    {
      id: 'completed-event',
      name: 'Completed Event',
      status: 'completed',
    },
    {
      id: 'failed-event',
      name: 'Failed Event',
      status: 'failed',
      error: 'Something went wrong',
    },
  ]
  const element = <EventStatus events={events} />
  t.is(element.props.events.length, 4)
  t.is(element.props.events[0].status, 'pending')
  t.is(element.props.events[3].error, 'Something went wrong')
})

test('EventStatus should handle nested events', (t) => {
  const events: EventStatusItem[] = [
    {
      id: 'parent-event',
      name: 'Parent Event',
      status: 'running',
      children: [
        {
          id: 'child-event-1',
          name: 'Child Event 1',
          status: 'completed',
        },
        {
          id: 'child-event-2',
          name: 'Child Event 2',
          status: 'running',
        },
      ],
    },
  ]
  const element = <EventStatus events={events} />
  t.is(element.props.events[0].children?.length, 2)
  t.is(element.props.events[0].children?.[0].status, 'completed')
})
