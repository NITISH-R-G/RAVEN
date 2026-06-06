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

  it('should identify Pattern 1 with phone type instead of device type', () => {
    const nodes: GraphNode[] = [
      { id: 'phone_1', label: 'Phone A', type: 'phone', status: 'neutral' },
      { id: 'person_7', label: 'Person 7', type: 'person', status: 'neutral' },
      { id: 'person_8', label: 'Person 8', type: 'person', status: 'neutral' },
    ];
    const edges: GraphEdge[] = [
      { source: 'phone_1', target: 'person_7', relationship: 'used_by', status: 'neutral' },
      { source: 'phone_1', target: 'person_8', relationship: 'used_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(1);
    expect(reports[0].patternType).toBe('reused_template');
    expect(reports[0].title).toBe('Multi-Identity Hardware Collision Ring');
  });

  it('should not flag Pattern 1 if device is connected to non-person nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'device_3', label: 'Device B', type: 'device', status: 'neutral' },
      { id: 'prop_1', label: 'Property 1', type: 'property', status: 'neutral' },
      { id: 'employer_2', label: 'Employer 2', type: 'employer', status: 'neutral' },
    ];
    const edges: GraphEdge[] = [
      { source: 'device_3', target: 'prop_1', relationship: 'used_by', status: 'neutral' },
      { source: 'device_3', target: 'employer_2', relationship: 'used_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(0);
  });

  it('should not flag Pattern 2 if multiple persons claim property but are not flagged', () => {
    const nodes: GraphNode[] = [
      { id: 'prop_flat402_1', label: 'Property flat402', type: 'property', status: 'neutral' },
      { id: 'person_9', label: 'Person 9', type: 'person', status: 'neutral' },
      { id: 'person_10', label: 'Person 10', type: 'person', status: 'neutral' },
    ];
    const edges: GraphEdge[] = [
      { source: 'person_9', target: 'prop_flat402_1', relationship: 'claims', status: 'neutral' },
      { source: 'person_10', target: 'prop_flat402_1', relationship: 'claims', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(0);
  });

  it('should not flag Pattern 2 if property ID does not include flat402', () => {
    const nodes: GraphNode[] = [
      { id: 'prop_house1', label: 'Property house1', type: 'property', status: 'neutral' },
      { id: 'person_11', label: 'Person 11', type: 'person', status: 'flagged' },
      { id: 'person_12', label: 'Person 12', type: 'person', status: 'flagged' },
    ];
    const edges: GraphEdge[] = [
      { source: 'person_11', target: 'prop_house1', relationship: 'claims', status: 'neutral' },
      { source: 'person_12', target: 'prop_house1', relationship: 'claims', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    expect(reports.length).toBe(0);
  });

  it('should handle cyclic graphs without entering infinite loop during BFS', () => {
    const nodes: GraphNode[] = [
      { id: 'person_13', label: 'Person 13', type: 'person', status: 'neutral' },
      { id: 'person_14', label: 'Person 14', type: 'person', status: 'neutral' },
      { id: 'employer_3', label: 'Employer 3', type: 'employer', status: 'neutral' },
    ];
    const edges: GraphEdge[] = [
      { source: 'person_13', target: 'person_14', relationship: 'knows', status: 'neutral' },
      { source: 'person_14', target: 'employer_3', relationship: 'employed_by', status: 'neutral' },
      { source: 'employer_3', target: 'person_13', relationship: 'employs', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    // This should complete without timing out
    const reports = db.findFraudRings();

    expect(reports.length).toBe(0);
  });

  it('should not detect Pattern 3 anomalies if depth is beyond the hardcoded path depth limit', () => {
    // limit is path.length < 3 to continue, meaning initial node (1) + edge (2) + edge (3).
    // Flagged employer at distance 4 shouldn't be reached if path limits correctly.
    const nodes: GraphNode[] = [
      { id: 'person_15', label: 'Person 15', type: 'person', status: 'neutral' },
      { id: 'person_16', label: 'Person 16', type: 'person', status: 'neutral' },
      { id: 'person_17', label: 'Person 17', type: 'person', status: 'neutral' },
      { id: 'person_18', label: 'Person 18', type: 'person', status: 'neutral' },
      { id: 'employer_4', label: 'Distant Fake Corp', type: 'employer', status: 'flagged' },
    ];
    // person_15 -> person_16 -> person_17 -> person_18 -> employer_4
    const edges: GraphEdge[] = [
      { source: 'person_15', target: 'person_16', relationship: 'knows', status: 'neutral' },
      { source: 'person_16', target: 'person_17', relationship: 'knows', status: 'neutral' },
      { source: 'person_17', target: 'person_18', relationship: 'knows', status: 'neutral' },
      { source: 'person_18', target: 'employer_4', relationship: 'employed_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    // The BFS should stop before reaching employer_4 from person_15
    // Actually, each person node initiates its own BFS.
    // So person_18 WILL detect employer_4 at depth 1.
    // We only care that person_15 DOES NOT detect employer_4.
    // We can verify this by checking that no report has person_15 as the starting node.
    const reportsForPerson15 = reports.filter(r => r.steps[0].nodeId === 'person_15');
    expect(reportsForPerson15.length).toBe(0);

    // person_18 will detect it because it's distance 1.
    // person_17 will detect it at distance 2.
    // person_16 will detect it at distance 3.
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
