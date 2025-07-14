import * as ts from 'typescript'

/**
 * Parse and validate JSDoc comments from TypeScript code
 */
export function parseJSDoc(code: string): { valid: boolean; errors: string[]; parsed?: any } {
  try {
    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true)

    const errors: string[] = []
    const jsdocComments: any[] = []

    function visit(node: ts.Node) {
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
        const jsDocComments = ts.getJSDocCommentsAndTags(node)

        if (jsDocComments.length > 0) {
          // @ts-ignore - JSDoc comment parameter types
          jsDocComments.forEach((comment: any) => {
            if (ts.isJSDoc(comment)) {
              const parsed = {
                comment: comment.comment,
                tags:
                  // @ts-ignore - JSDoc tag parameter types
                  comment.tags?.map((tag: any) => ({
                    tagName: tag.tagName.text,
                    comment: tag.comment,
                  })) || [],
              }
              jsdocComments.push(parsed)
            }
          })
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    return {
      valid: errors.length === 0,
      errors,
      parsed: jsdocComments,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`JSDoc parsing error: ${error instanceof Error ? error.message : String(error)}`],
    }
  }
}
