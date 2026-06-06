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

  it('should verify the traversal stops exactly at depth 3 (Graph Database Depth Limit)', () => {
    // The graph BFS loop limits path discovery using `if (path.length < 3)`
    // This implies that starting from the root node (which is pushed to path, length 1)
    // We traverse edge 1 (path length becomes 2) -> we can traverse another edge
    // We traverse edge 2 (path length becomes 3) -> we CANNOT traverse another edge from this path
    // Let's create a chain:
    // Node 1 (Root) -> Node 2 -> Node 3 -> Node 4 -> Node 5 (Flagged Employer)
    // - Node 1 to Node 5 path length would be 5 (Node 1, Node 2, Node 3, Node 4, Node 5)
    // Wait, the path inside BFS actually records steps.
    // Step 0: Anchor (Root)
    // Step 1: Neighbor 1
    // Step 2: Neighbor 2
    // Step 3: Neighbor 3

    // We test that a flagged employer at distance 2 (path length 3) IS detected
    // And a flagged employer at distance 3 (path length 4) is NOT detected by the root node

    const nodes: GraphNode[] = [
      { id: 'person_root_1', label: 'Person Root 1', type: 'person', status: 'neutral' },
      { id: 'person_chain_2', label: 'Person Chain 2', type: 'person', status: 'neutral' },
      { id: 'person_chain_3', label: 'Person Chain 3', type: 'person', status: 'neutral' },
      { id: 'employer_dist_2', label: 'Employer Dist 2', type: 'employer', status: 'flagged' },
      { id: 'person_chain_4', label: 'Person Chain 4', type: 'person', status: 'neutral' },
      { id: 'employer_dist_3', label: 'Employer Dist 3', type: 'employer', status: 'flagged' },
    ];

    const edges: GraphEdge[] = [
      // Branch 1: Path length 3 (Root -> Node2 -> Employer)
      // Root (1) -> Node2 (2) -> Employer (3)
      { source: 'person_root_1', target: 'person_chain_2', relationship: 'knows', status: 'neutral' },
      { source: 'person_chain_2', target: 'employer_dist_2', relationship: 'employed_by', status: 'neutral' },

      // Branch 2: Path length 4 (Root -> Node3 -> Node4 -> Employer)
      // Root (1) -> Node3 (2) -> Node4 (3) -> Employer (4)
      { source: 'person_root_1', target: 'person_chain_3', relationship: 'knows', status: 'neutral' },
      { source: 'person_chain_3', target: 'person_chain_4', relationship: 'knows', status: 'neutral' },
      { source: 'person_chain_4', target: 'employer_dist_3', relationship: 'employed_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    // Check reports initiated by person_root_1
    const rootReports = reports.filter(r => r.steps[0].nodeId === 'person_root_1');

    // The traversal should find employer_dist_2 because the path length is 3
    const foundDist2 = rootReports.some(r => r.steps[r.steps.length - 1].nodeId === 'employer_dist_2');
    expect(foundDist2).toBe(true);

    // The traversal should NOT find employer_dist_3 because the path length would be 4, which exceeds `< 3` check before queue push
    const foundDist3 = rootReports.some(r => r.steps[r.steps.length - 1].nodeId === 'employer_dist_3');

    // Ah, wait. Let's trace the path lengths:
    // Queue initial: { current: 'person_root_1', path: [nodeId: 'person_root_1'] } (path.length = 1)
    // Dequeue 'person_root_1':
    //   Neighbor 'person_chain_3': newPath = [root, chain3] (length = 2).
    //   path.length (1) < 3 is true, so pushes { current: 'person_chain_3', path: [root, chain3] }.
    // Dequeue 'person_chain_3':
    //   Neighbor 'person_chain_4': newPath = [root, chain3, chain4] (length = 3).
    //   path.length (2) < 3 is true, so pushes { current: 'person_chain_4', path: [root, chain3, chain4] }.
    // Dequeue 'person_chain_4':
    //   Neighbor 'employer_dist_3': newPath = [root, chain3, chain4, employer3] (length = 4).
    //   path.length (3) < 3 is FALSE. So it DOES NOT push to queue.
    //   BUT! Before the check `if (path.length < 3)`, it ALREADY processes the node:
    //   `if (neighborNode.type === "employer" && neighborNode.status === "flagged") { reports.push(...) }`
    //   So employer_dist_3 IS detected at distance 3, but its neighbors wouldn't be traversed!
    // To make sure distance 4 is NOT detected, we need a path of length 5:
    // Root (1) -> Node3 (2) -> Node4 (3) -> Node5 (4) -> Employer (5)
    // Dequeue Node4 (path length = 3). path.length < 3 is false.
    // So Node4's neighbors (Node5) will NEVER be queued! Thus Employer (5) won't be seen.

    expect(foundDist3).toBe(true); // Distance 3 IS actually detected because the limit prevents QUEUING the next step, not processing the current neighbor.
  });

  it('should verify the traversal stops completely for depth 4+ (Graph Database Depth Limit)', () => {
    // Let's test that a node at distance 4 from root is absolutely not detected.
    const nodes: GraphNode[] = [
      { id: 'person_root', label: 'Person Root', type: 'person', status: 'neutral' },
      { id: 'person_step_1', label: 'Step 1', type: 'person', status: 'neutral' },
      { id: 'person_step_2', label: 'Step 2', type: 'person', status: 'neutral' },
      { id: 'person_step_3', label: 'Step 3', type: 'person', status: 'neutral' },
      { id: 'employer_dist_4', label: 'Employer Dist 4', type: 'employer', status: 'flagged' },
    ];

    const edges: GraphEdge[] = [
      { source: 'person_root', target: 'person_step_1', relationship: 'knows', status: 'neutral' },
      { source: 'person_step_1', target: 'person_step_2', relationship: 'knows', status: 'neutral' },
      { source: 'person_step_2', target: 'person_step_3', relationship: 'knows', status: 'neutral' },
      { source: 'person_step_3', target: 'employer_dist_4', relationship: 'employed_by', status: 'neutral' },
    ];

    const db = new GraphDatabase(nodes, edges);
    const reports = db.findFraudRings();

    const rootReports = reports.filter(r => r.steps[0].nodeId === 'person_root');
    const foundDist4 = rootReports.some(r => r.steps[r.steps.length - 1].nodeId === 'employer_dist_4');

    expect(foundDist4).toBe(false);
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
