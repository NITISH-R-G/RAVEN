import { describe, it, expect } from 'vitest';
import { GraphDatabase } from './graphDB';
import { GraphNode, GraphEdge } from '../types';

describe('GraphDatabase', () => {
  describe('addEdge', () => {
    it('should add an edge and a reverse link when both source and target nodes exist', () => {
      const nodeA: GraphNode = { id: 'A', label: 'Person A', type: 'person', status: 'neutral' };
      const nodeB: GraphNode = { id: 'B', label: 'Person B', type: 'person', status: 'neutral' };

      const db = new GraphDatabase([nodeA, nodeB], []);

      const edge: GraphEdge = {
        source: 'A',
        target: 'B',
        relationship: 'Knows',
        status: 'verified'
      };

      db.addEdge(edge);

      // Access private adjacencyList for testing purposes
      const adjacencyList = (db as any).adjacencyList as Map<string, GraphEdge[]>;

      expect(adjacencyList.has('A')).toBe(true);
      expect(adjacencyList.get('A')).toHaveLength(1);
      expect(adjacencyList.get('A')![0]).toEqual(edge);

      expect(adjacencyList.has('B')).toBe(true);
      expect(adjacencyList.get('B')).toHaveLength(1);
      expect(adjacencyList.get('B')![0]).toEqual({
        source: 'B',
        target: 'A',
        relationship: 'Knows (Reverse Link)',
        status: 'verified'
      });
    });

    it('should not add an edge if the source node is missing', () => {
      const nodeB: GraphNode = { id: 'B', label: 'Person B', type: 'person', status: 'neutral' };

      const db = new GraphDatabase([nodeB], []);

      const edge: GraphEdge = {
        source: 'A', // Missing source
        target: 'B',
        relationship: 'Knows',
        status: 'verified'
      };

      db.addEdge(edge);

      const adjacencyList = (db as any).adjacencyList as Map<string, GraphEdge[]>;

      // Node A is missing, so it shouldn't have edges
      expect(adjacencyList.has('A')).toBe(false);
      // Node B shouldn't have reverse edges
      expect(adjacencyList.get('B')).toHaveLength(0);
    });

    it('should not add an edge if the target node is missing', () => {
      const nodeA: GraphNode = { id: 'A', label: 'Person A', type: 'person', status: 'neutral' };

      const db = new GraphDatabase([nodeA], []);

      const edge: GraphEdge = {
        source: 'A',
        target: 'B', // Missing target
        relationship: 'Knows',
        status: 'verified'
      };

      db.addEdge(edge);

      const adjacencyList = (db as any).adjacencyList as Map<string, GraphEdge[]>;

      // Node A shouldn't have edges
      expect(adjacencyList.get('A')).toHaveLength(0);
      expect(adjacencyList.has('B')).toBe(false);
    });
  });
});
