import test from 'ava'
import React from 'react'

import { Icon } from '../../src/components/media/Icon.js'

test('Icon component should pass basic test', (t) => {
  t.pass()
})

test('Icon component should create JSX element', (t) => {
  const element = <Icon name='IoRocketSharp' />
  t.truthy(element)
  t.is(element.type, Icon)
  t.is(element.props.name, 'IoRocketSharp')
})

test('Icon component should accept different icon names', (t) => {
  const heartIcon = <Icon name='FaHeart' />
  const homeIcon = <Icon name='MdHome' />

  t.is(heartIcon.props.name, 'FaHeart')
  t.is(homeIcon.props.name, 'MdHome')
})
