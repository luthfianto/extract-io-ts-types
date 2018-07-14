const typescriptParser = require("typescript-parser");
const parser = new typescriptParser.TypescriptParser();

/**
 *
 * @param {typescriptParser.Declaration} interfaceDeclaration
 */
async function extractInterface(interfaceDeclaration) {
    const interfaceProperties = interfaceDeclaration.properties;
    const pretty = interfaceProperties.map((method) => {
        const name = `${method.name}`;

        let returnType = method.type || "{}";
        if (returnType.endsWith("[]")) {
            const t = returnType.slice(0, returnType.length - 2)
            returnType = `t.array(t.${t})`;
        } else {
            returnType = `t.${returnType}`;
        }

        return `${name}: ${returnType}`;
    });

    const interfaceName = interfaceDeclaration.name;

    const res = `
const ${interfaceName} = t.type({
    ${pretty.join(",\n    ")},
});`;

    return res;
}

async function extractInterfaces(sourceString) {
    const parsed = await parser.parseSource(sourceString);

    const interfaceDeclarations = parsed.declarations.filter((declaration) => declaration instanceof typescriptParser.InterfaceDeclaration);
    const results = await Promise.all(interfaceDeclarations.map(extractInterface));

    return results.join("\n");
}

module.exports = { extractInterface, extractInterfaces };
