export type SelectedModelType = "anthropic-finance" | "fingpt-llama" | "layoutlm-v3";

export interface ParsedEntity {
  field: string;
  value: string;
  classification: "IDENTITY" | "FINANCIAL" | "ORGANIZATION" | "TEMPORAL" | "GEOGRAPHIC";
  confidence: number;
  extractedFrom: string;
  status: "verified" | "discrepant" | "warning";
}

export interface LayoutDiscovered {
  gridMatch: string;
  fieldsCount: number;
  density: string;
  alignmentConfidence: number;
}
