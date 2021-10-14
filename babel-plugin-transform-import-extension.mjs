export default function (babel) {
  const { types } = babel;
  return {
    visitor: {
      Program: {
        enter: (programPath, state) => {
          programPath.traverse(
            {
              ImportDeclaration: (declaration) => {
                const source = declaration.get("source");
                source.replaceWith(
                  types.stringLiteral(
                    source.node.value.replace(/\.mjs$/, ".js")
                  )
                );
              },
            },
            state
          );
        },
      },
    },
  };
}
