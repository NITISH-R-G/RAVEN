import fs from 'fs';
import path from 'path';

const REPO_ROOT = process.cwd();
const ARCHITECTURE_DIR = path.join(REPO_ROOT, 'docs', 'architecture');
const OUTPUT_FILE = path.join(ARCHITECTURE_DIR, 'repo-architecture.json');

// Ensure output directory exists
if (!fs.existsSync(ARCHITECTURE_DIR)) {
  fs.mkdirSync(ARCHITECTURE_DIR, { recursive: true });
}

function analyzeRepository() {
  const architecture = {
    timestamp: new Date().toISOString(),
    frameworks: [],
    dependencies: {},
    devDependencies: {},
    scripts: {},
    fileStructure: [],
    entryPoints: [],
    configFiles: []
  };

  // Analyze package.json
  const packageJsonPath = path.join(REPO_ROOT, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    architecture.dependencies = pkg.dependencies || {};
    architecture.devDependencies = pkg.devDependencies || {};
    architecture.scripts = pkg.scripts || {};

    // Detect frameworks based on dependencies
    if (architecture.dependencies['react'] || architecture.devDependencies['react']) {
      architecture.frameworks.push('React');
    }
    if (architecture.dependencies['express']) {
      architecture.frameworks.push('Express');
    }
    if (architecture.dependencies['vite'] || architecture.devDependencies['vite']) {
      architecture.frameworks.push('Vite');
    }
    if (architecture.dependencies['@tailwindcss/vite'] || architecture.devDependencies['tailwindcss']) {
      architecture.frameworks.push('Tailwind CSS');
    }
    if (architecture.devDependencies['typescript']) {
      architecture.frameworks.push('TypeScript');
    }
  }

  // Detect config files
  const importantConfigs = ['tsconfig.json', 'vite.config.ts', '.env.example', 'eslint.config.js', 'prettier.config.js'];
  for (const config of importantConfigs) {
    if (fs.existsSync(path.join(REPO_ROOT, config))) {
      architecture.configFiles.push(config);
    }
  }

  // Scan file structure
  function scanDir(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build']) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (excludeDirs.includes(file)) continue;

      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      const relativePath = path.relative(REPO_ROOT, filePath);

      if (stat.isDirectory()) {
        results.push({
          type: 'directory',
          name: file,
          path: relativePath,
          children: scanDir(filePath, excludeDirs)
        });
      } else {
        results.push({
          type: 'file',
          name: file,
          path: relativePath,
          size: stat.size,
          extension: path.extname(file)
        });

        // Detect entry points
        if (['server.ts', 'main.tsx', 'index.js', 'app.ts'].includes(file)) {
          architecture.entryPoints.push(relativePath);
        }
      }
    }
    return results;
  }

  architecture.fileStructure = scanDir(REPO_ROOT);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(architecture, null, 2));
  console.log(`Repository architecture analyzed and saved to ${OUTPUT_FILE}`);
}

analyzeRepository();
