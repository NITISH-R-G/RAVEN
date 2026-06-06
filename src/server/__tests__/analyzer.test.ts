import { describe, it, expect } from 'vitest';
import { analyzeDocumentsDynamically } from '../analyzer';
import { DocumentItem } from '../../types';

describe('analyzeDocumentsDynamically', () => {
  it('should handle non-string content securely without crashing', () => {
    // Inject invalid object/array types into doc.content
    const docs: any[] = [
      {
        id: '1',
        name: 'test1',
        type: 'OTHER',
        content: { evil: 'object' },
      },
      {
        id: '2',
        name: 'test2',
        type: 'OTHER',
        content: ['evil', 'array'],
      },
      {
        id: '3',
        name: 'test3',
        type: 'OTHER',
        content: null,
      },
      {
        id: '4',
        name: 'test4',
        type: 'OTHER',
        content: undefined,
      },
      {
        id: '5',
        name: 'test5',
        type: 'OTHER',
        content: 12345,
      }
    ];

    expect(() => {
      analyzeDocumentsDynamically(docs);
    }).not.toThrow();

    const result = analyzeDocumentsDynamically(docs);
    expect(result).toBeDefined();
    expect(result.score).toBeDefined();
  });
});
