import { describe, it, expect } from 'vitest';
import { GraphDatabase } from '../graphDB';
import { GraphNode, GraphEdge } from '../../types';

describe('GraphDatabase.findFraudRings', () => {
  it('should identify Multi-Identity Hardware Collision Ring (Pattern 1)', () => {
    const nodes: GraphNode[] = [
      { id: 'device_1', label: 'Device A', type: 'device', status: 'neutral' },
      { id: 'person_1', label: 'Person 1', type: 'person', status: 'neutral' },
      { id: 'person_2', label: 'Person 2', type: 'person', status: 'neutral' },
    ];
    const edges: GraphEdge[] = [
      { source: 'device_1', target: 'person_1', relationship: 'used_by', status: 'neutral' },
      { source: 'device_1', target: 'person_2', relationship: 'used_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(1);
    expect(reports[0].patternType).toBe('reused_template');
    expect(reports[0].title).toBe('Multi-Identity Hardware Collision Ring');
    expect(reports[0].severity).toBe('high');

    const stepIds = reports[0].steps.map(s => s.nodeId);
    expect(stepIds).toContain('device_1');
    expect(stepIds).toContain('person_1');
    expect(stepIds).toContain('person_2');
  });

  it('should identify Concurrent Multi-Lien Collusion Ring (Pattern 2)', () => {
    const nodes: GraphNode[] = [
      { id: 'prop_flat402', label: 'Property flat402', type: 'property', status: 'neutral' },
      { id: 'person_3', label: 'Person 3', type: 'person', status: 'flagged' },
      { id: 'person_4', label: 'Person 4', type: 'person', status: 'flagged' },
    ];
    const edges: GraphEdge[] = [
      { source: 'person_3', target: 'prop_flat402', relationship: 'claims', status: 'neutral' },
      { source: 'person_4', target: 'prop_flat402', relationship: 'claims', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(1);
    expect(reports[0].patternType).toBe('shared_address');
    expect(reports[0].title).toBe('Concurrent Multi-Lien Collusion Ring');
    expect(reports[0].severity).toBe('high');

    const stepIds = reports[0].steps.map(s => s.nodeId);
    expect(stepIds).toContain('prop_flat402');
    expect(stepIds).toContain('person_3');
    expect(stepIds).toContain('person_4');
  });

  it('should identify Synthetic Corporation Employment Loop (Pattern 3.1)', () => {
    const nodes: GraphNode[] = [
      { id: 'person_5', label: 'Person 5', type: 'person', status: 'neutral' },
      { id: 'employer_1', label: 'Fake Corp', type: 'employer', status: 'flagged' },
    ];
    const edges: GraphEdge[] = [
      { source: 'person_5', target: 'employer_1', relationship: 'employed_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(1);
    expect(reports[0].patternType).toBe('identity_bridge');
    expect(reports[0].title).toBe('Synthetic Corporation Employment Loop');
    expect(reports[0].severity).toBe('high');
  });

  it('should identify Interstate Session Routing Anomaly (Pattern 3.2)', () => {
    const nodes: GraphNode[] = [
      { id: 'person_6', label: 'Person 6', type: 'person', status: 'neutral' },
      { id: 'device_2', label: 'Delhi Proxy', type: 'device', status: 'flagged' },
    ];
    const edges: GraphEdge[] = [
      { source: 'person_6', target: 'device_2', relationship: 'connected_from', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(1);
    expect(reports[0].patternType).toBe('identity_bridge');
    expect(reports[0].title).toBe('Interstate Session Routing Anomaly');
    expect(reports[0].severity).toBe('medium');
  });

  it('should return empty array for benign graphs without fraud patterns', () => {
    const nodes: GraphNode[] = [
      { id: 'device_ok', label: 'Device OK', type: 'device', status: 'neutral' },
      { id: 'person_ok', label: 'Person OK', type: 'person', status: 'neutral' },
      { id: 'prop_ok', label: 'Property OK', type: 'property', status: 'neutral' },
      { id: 'employer_ok', label: 'Employer OK', type: 'employer', status: 'neutral' },
    ];
    const edges: GraphEdge[] = [
      { source: 'device_ok', target: 'person_ok', relationship: 'used_by', status: 'neutral' },
      { source: 'person_ok', target: 'prop_ok', relationship: 'owns', status: 'neutral' },
      { source: 'person_ok', target: 'employer_ok', relationship: 'employed_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(0);
  });
});
