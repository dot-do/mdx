import test from 'ava'
import React from 'react'
import { Image, type ImageProps } from '../../src/components/media/Image.js'

const MockIcon = (props: any) => <div {...props} />

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

test('Image component should create JSX element', (t) => {
  const element = <Image icon={MockIcon} />
  t.truthy(element)
  t.is(element.type, Image)
})

test('Image component should accept svg prop', (t) => {
  const svgString = '<svg width="10" height="10"><circle cx="5" cy="5" r="4" /></svg>'
  const element = <Image svg={svgString} />
  t.truthy(element)
  t.is(element.props.svg, svgString)
})

test('Image component should accept color prop', (t) => {
  const element = <Image icon={MockIcon} color='red' />
  t.truthy(element)
  t.is(element.props.color, 'red')
})

test('Image component should accept width and height props', (t) => {
  const element = <Image icon={MockIcon} width={20} height={10} />
  t.truthy(element)
  t.is(element.props.width, 20)
  t.is(element.props.height, 10)
})
