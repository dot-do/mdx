import { Text } from 'ink'
import React, { useState, useCallback } from 'react'
import { useTimer } from 'react-use-precision-timer'

const spinnerTypes: Record<string, string[]> = {
  dots: ['⢎ ', '⠎⠁', '⠊⠑', '⠈⠱', ' ⡱', '⢀⡰', '⢄⡠', '⢆⡀'],
  ball: ['( ●    )', '(  ●   )', '(   ●  )', '(    ● )', '(     ●)', '(    ● )', '(   ●  )', '(  ●   )', '( ●    )', '(●     )'],
}

export default function Spinner({ type = 'dots' }: { type?: string }): React.JSX.Element {
  const frames = spinnerTypes[type || 'dots'] || []
  const interval = 80
  const [frame, setFrame] = useState(0)

  const callback = useCallback(() => {
    setFrame((previousFrame: number) => {
      const isLastFrame = previousFrame === frames.length - 1
      return isLastFrame ? 0 : previousFrame + 1
    })
  }, [frames.length])

  const timer = useTimer({ delay: interval }, callback)

  // Start the timer when component mounts
  React.useEffect(() => {
    timer.start()
    return () => timer.stop()
  }, [timer])

  return <Text>{frames[frame]}</Text>
}
