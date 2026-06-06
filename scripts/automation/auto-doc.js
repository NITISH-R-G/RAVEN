import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const REPO_ROOT = process.cwd();
const ARCHITECTURE_DIR = path.join(REPO_ROOT, 'docs', 'architecture');
const README_PATH = path.join(REPO_ROOT, 'README.md');

// We use the Gemini API (provided via @google/genai) to generate the README.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. Skipping AI documentation generation.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function generateDocumentation() {
  console.log('Generating AI documentation...');

  const archPath = path.join(ARCHITECTURE_DIR, 'repo-architecture.json');
  if (!fs.existsSync(archPath)) {
    console.error('repo-architecture.json not found. Run repo-analyzer.js first.');
    process.exit(1);
  }

  const architecture = JSON.parse(fs.readFileSync(archPath, 'utf8'));

  // Get the current README to retain some context or structure
  let currentReadme = '';
  if (fs.existsSync(README_PATH)) {
    currentReadme = fs.readFileSync(README_PATH, 'utf8');
  }

  const prompt = `
You are an expert AI repository maintainer. Your task is to rewrite the README.md for this repository to keep it fully up to date based on the following architectural state.

Repository Architecture Overview (JSON):
${JSON.stringify(architecture, null, 2)}

Requirements for the README:
- Project overview
- Key features
- Technology stack (extract from frameworks and dependencies)
- System architecture
- Repository structure
- Setup instructions (use scripts)
- Deployment instructions
- Environment variables (mention any config files detected)
- Contribution guide
- Include markdown placeholders or Mermaid diagrams for architecture if appropriate.
- Keep it professional, detailed, and structured.

Generate the exact Markdown content for the README. Do not wrap it in a code block or include extra introductory text, just output the Markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let newReadme = response.text;

    // Sometimes the model wraps the whole response in a markdown block despite instructions
    if (newReadme.startsWith('\`\`\`markdown\n') && newReadme.endsWith('\n\`\`\`')) {
        newReadme = newReadme.substring(12, newReadme.length - 4);
    } else if (newReadme.startsWith('\`\`\`\n') && newReadme.endsWith('\n\`\`\`')) {
        newReadme = newReadme.substring(4, newReadme.length - 4);
    }

    fs.writeFileSync(README_PATH, newReadme.trim() + '\n');
    console.log('README.md updated successfully.');

  } catch (error) {
    console.error('Error generating documentation:', error);
  }
}

generateDocumentation();
