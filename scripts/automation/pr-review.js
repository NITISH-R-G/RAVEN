import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const REPO_ROOT = process.cwd();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. Skipping AI PR review.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function reviewPR() {
  console.log('Running AI PR review...');

  // In a real GitHub Action, this would be fetched from GitHub API or a diff file
  // For the sake of automation script setup, we read a dummy diff or look at git diff.
  const diffPath = process.env.PR_DIFF_PATH || path.join(REPO_ROOT, 'pr.diff');

  if (!fs.existsSync(diffPath)) {
    console.warn(`No diff found at ${diffPath}. Ensure PR_DIFF_PATH is set or pipe git diff to pr.diff`);
    process.exit(0);
  }

  const diffContent = fs.readFileSync(diffPath, 'utf8');

  const prompt = `
You are an expert AI repository maintainer and code reviewer.
Review the following pull request diff. Focus specifically on:
- Architectural modifications
- Breaking changes
- Security implications
- Missing documentation
- Code quality

Provide your review as a structured Markdown comment. Include actionable feedback.

Diff:
${diffContent}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reviewContent = response.text;

    const reviewOutputPath = path.join(REPO_ROOT, 'pr-review.md');
    fs.writeFileSync(reviewOutputPath, reviewContent);
    console.log(`Review saved to ${reviewOutputPath}`);

    // In a real GH action, you would post this to the PR using github-script or gh cli

  } catch (error) {
    console.error('Error generating PR review:', error);
  }
}

reviewPR();
