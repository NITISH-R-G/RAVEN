import React, { useState, useEffect } from "react";
import { DocumentItem } from "../types";
import { parseDocument, ParsedEntity, LayoutDiscovered } from "../utils/documentParser";
import { ModelControl, NLPModelType } from "./NLPDocumentExtractorComponents/ModelControl";
import { LayoutVisualizer } from "./NLPDocumentExtractorComponents/LayoutVisualizer";
import { ParsedEntitiesList } from "./NLPDocumentExtractorComponents/ParsedEntitiesList";
import { ModelLogDetails } from "./NLPDocumentExtractorComponents/ModelLogDetails";

interface NLPDocumentExtractorProps {
  document: DocumentItem;
}

export const NLPDocumentExtractor: React.FC<NLPDocumentExtractorProps> = ({ document }) => {
  const [selectedModel, setSelectedModel] = useState<NLPModelType>("anthropic-finance");
  const [parsedEntities, setParsedEntities] = useState<ParsedEntity[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [layoutDiscovered, setLayoutDiscovered] = useState<LayoutDiscovered>({
    gridMatch: "Standard ITR Template",
    fieldsCount: 0,
    density: "Normal",
    alignmentConfidence: 99.5
  });

  // Simulate parsing trigger whenever document content or selected model changes
  useEffect(() => {
    setIsParsing(true);
    const timer = setTimeout(() => {
      const { entities, layout } = parseDocument(document.content, document.type, selectedModel, document.id);
      setParsedEntities(entities);
      setLayoutDiscovered(layout);
      setIsParsing(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [document.content, document.type, selectedModel, document.id]);

  return (
    <div className="bg-[#101012] border border-white/5 rounded-xl p-4 flex flex-col gap-4 select-text">
      
      {/* Model Control Selector Header */}
      <ModelControl selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

      {/* Grid: Left layout coordinates visualization, right parsed fields list */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Layout Bounding Box Visualizer Panel */}
        <LayoutVisualizer document={document} layoutDiscovered={layoutDiscovered} />

        {/* NLP Parsed Entities Table/List */}
        <ParsedEntitiesList isParsing={isParsing} parsedEntities={parsedEntities} />
      </div>

      {/* Model Log Details */}
      <ModelLogDetails selectedModel={selectedModel} />
    </div>
  );
};
