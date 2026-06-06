import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const REPO_ROOT = process.cwd();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. Skipping AI release summary.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function generateReleaseSummary() {
  console.log('Generating AI release summary...');

  // Read git log for recent commits (mocked here or passed via env in GH Actions)
  const commitsPath = process.env.COMMITS_PATH || path.join(REPO_ROOT, 'recent_commits.txt');

  if (!fs.existsSync(commitsPath)) {
    console.warn(`No commits found at ${commitsPath}. Ensure COMMITS_PATH is set.`);
    process.exit(0);
  }

  const commitsContent = fs.readFileSync(commitsPath, 'utf8');

  const prompt = `
You are an expert AI repository maintainer.
Based on the following commit history since the last release, generate a detailed release summary and changelog.
Categorize changes into:
- Features
- Bug Fixes
- Architectural Changes
- Documentation
- Chores

Format the response in Markdown suitable for GitHub Release Notes.

Commits:
${commitsContent}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const releaseNotesContent = response.text;

    const releaseNotesPath = path.join(REPO_ROOT, 'release-notes.md');
    fs.writeFileSync(releaseNotesPath, releaseNotesContent);
    console.log(`Release notes saved to ${releaseNotesPath}`);

  } catch (error) {
    console.error('Error generating release notes:', error);
  }
}

generateReleaseSummary();
