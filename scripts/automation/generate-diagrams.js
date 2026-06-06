import fs from 'fs';
import path from 'path';
import madge from 'madge';

const REPO_ROOT = process.cwd();
const ARCHITECTURE_DIR = path.join(REPO_ROOT, 'docs', 'architecture');

if (!fs.existsSync(ARCHITECTURE_DIR)) {
  fs.mkdirSync(ARCHITECTURE_DIR, { recursive: true });
}

async function generateDiagrams() {
  console.log('Generating architecture diagrams...');

  const entryPoints = [
    path.join(REPO_ROOT, 'src', 'main.tsx'),
    path.join(REPO_ROOT, 'server.ts'),
  ];

  for (const entryPoint of entryPoints) {
    if (fs.existsSync(entryPoint)) {
      const fileName = path.basename(entryPoint, path.extname(entryPoint));

      try {
        const res = await madge(entryPoint, {
          tsConfig: path.join(REPO_ROOT, 'tsconfig.json'),
          includeNpm: false,
          fileExtensions: ['ts', 'tsx', 'js', 'jsx']
        });

        // Generate SVG
        const svgPath = path.join(ARCHITECTURE_DIR, `${fileName}-dependencies.svg`);
        await res.image(svgPath);
        console.log(`Generated SVG diagram: ${svgPath}`);

        // Generate JSON representation
        const jsonPath = path.join(ARCHITECTURE_DIR, `${fileName}-dependencies.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(res.obj(), null, 2));
        console.log(`Generated JSON dependency graph: ${jsonPath}`);

        // Generate a simple Mermaid equivalent
        const mermaidPath = path.join(ARCHITECTURE_DIR, `${fileName}-dependencies.md`);
        let mermaidCode = '```mermaid\ngraph TD;\n';
        const deps = res.obj();

        for (const [module, moduleDeps] of Object.entries(deps)) {
          for (const dep of moduleDeps) {
            // Clean up module names for Mermaid
            const cleanModule = module.replace(/[^a-zA-Z0-9]/g, '_');
            const cleanDep = dep.replace(/[^a-zA-Z0-9]/g, '_');
            mermaidCode += `  ${cleanModule}["${module}"] --> ${cleanDep}["${dep}"];\n`;
          }
        }
        mermaidCode += '```\n';
        fs.writeFileSync(mermaidPath, mermaidCode);
        console.log(`Generated Mermaid diagram: ${mermaidPath}`);

      } catch (err) {
        console.error(`Error generating diagram for ${entryPoint}:`, err);
      }
    } else {
       console.log(`Skipping diagram for ${entryPoint} as it does not exist.`);
    }
  }
}

generateDiagrams().catch(console.error);
