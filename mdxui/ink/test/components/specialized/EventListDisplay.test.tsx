import test from 'ava'
import React from 'react'
import { EventListDisplay } from '../../../src/components/specialized/EventListDisplay.js'
import type { EventStatusItem } from '../../../src/components/specialized/EventStatusTypes.js'

test('EventListDisplay component should create JSX element', (t) => {
  const events: EventStatusItem[] = []
  const element = <EventListDisplay events={events} />
  t.truthy(element)
  t.is(element.type, EventListDisplay)
  t.deepEqual(element.props.events, [])
})

test('EventListDisplay should accept events prop', (t) => {
  const events: EventStatusItem[] = [
    {
      id: 'test-event',
      name: 'Test Event',
      status: 'pending',
    },
  ]
  const element = <EventListDisplay events={events} />
  t.deepEqual(element.props.events, events)
})

test('EventListDisplay should accept title prop', (t) => {
  const events: EventStatusItem[] = []
  const element = <EventListDisplay events={events} title='Event List' />
  t.is(element.props.title, 'Event List')
})

test('EventListDisplay should handle events with different statuses', (t) => {
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
  const element = <EventListDisplay events={events} />
  t.is(element.props.events.length, 4)
  t.is(element.props.events[0].status, 'pending')
  t.is(element.props.events[3].error, 'Something went wrong')
})
