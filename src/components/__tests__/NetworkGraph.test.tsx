// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NetworkGraph } from "../NetworkGraph";
import { GraphNode, GraphEdge } from "../../types";

const mockNodes: GraphNode[] = [
  { id: "1", label: "John Doe", type: "person", status: "flagged", details: "Main suspect" },
  { id: "2", label: "123 Main St", type: "address", status: "neutral", details: "Home address" },
  { id: "3", label: "Acme Corp", type: "employer", status: "verified", details: "Verified employer" }
];

const mockEdges: GraphEdge[] = [
  { source: "1", target: "2", relationship: "LIVES_AT", status: "neutral" },
  { source: "1", target: "3", relationship: "WORKS_AT", status: "verified" }
];

describe("NetworkGraph Component", () => {
  it("renders empty state when no node is selected initially", () => {
    render(<NetworkGraph nodes={mockNodes} edges={mockEdges} />);

    // Check for layer active text
    expect(screen.getByText("Layer 3 Graph Traversal Active:")).toBeDefined();
    expect(screen.getByText("3 nodes mapped")).toBeDefined();

    // Check for the initial empty details panel
    expect(screen.getByText("Node Diagnostics")).toBeDefined();
    expect(screen.getByText("Click any network node on the left to inspect multi-document associations.")).toBeDefined();
  });

  it("renders nodes and edges correctly", () => {
    render(<NetworkGraph nodes={mockNodes} edges={mockEdges} />);

    // Nodes labels should be rendered
    expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("123 Main St").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0);

    // Edge relationships should be rendered
    expect(screen.getAllByText("LIVES_AT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WORKS_AT").length).toBeGreaterThan(0);
  });

  it("clicking a node triggers onSelectNode and displays details", () => {
    const handleSelectNode = vi.fn();
    const { container } = render(<NetworkGraph nodes={mockNodes} edges={mockEdges} onSelectNode={handleSelectNode} />);

    // Find the group `<g>` elements which have the onClick handler
    const groups = container.querySelectorAll("g.cursor-pointer");
    // Since mockNodes has 3 nodes, groups[1] corresponds to the 2nd node ('123 Main St')
    fireEvent.click(groups[1]);

    // Ensure callback was called with the correct node
    expect(handleSelectNode).toHaveBeenCalledWith(mockNodes[1]);

    // Side panel should now show the selected node details
    expect(screen.getByText("Node Entity")).toBeDefined();
    expect(screen.getAllByText("123 Main St").length).toBeGreaterThan(1);
    expect(screen.getByText("Home address")).toBeDefined();
    expect(screen.getByText("NEUTRAL / CHECKED")).toBeDefined();
    expect(screen.getByText("address")).toBeDefined();
  });

  it("shows specific warning block when a flagged node is selected", () => {
    const { container } = render(<NetworkGraph nodes={mockNodes} edges={mockEdges} />);

    // Find the group `<g>` elements which have the onClick handler
    const groups = container.querySelectorAll("g.cursor-pointer");
    // groups[0] corresponds to the first node ('John Doe' which is flagged)
    fireEvent.click(groups[0]);

    // Should show critical status and warning block
    expect(screen.getByText("CRITICAL EXPOSURE")).toBeDefined();
    expect(screen.getByText("Coherence Block Flag:")).toBeDefined();
    expect(screen.getByText(/Mapped connection bypasses isolation limits/)).toBeDefined();
  });
});
