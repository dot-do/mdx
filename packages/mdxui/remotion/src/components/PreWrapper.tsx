import {
  AnnotationHandler,
  Pre as CodehikePre,
  HighlightedCode,
} from "codehike/code"
import React from "react"

interface PreWrapperProps {
  code: HighlightedCode;
  handlers?: AnnotationHandler[];
  style?: React.CSSProperties;
}

export const PreWrapper = React.forwardRef<HTMLPreElement, PreWrapperProps>(
  ({ code, handlers, style, ...props }, ref) => {
    const PreComponent = CodehikePre as any;
    return (
      <PreComponent
        ref={ref}
        code={code}
        handlers={handlers}
        style={style}
        {...props}
      />
    );
  },
);

PreWrapper.displayName = "PreWrapper";
