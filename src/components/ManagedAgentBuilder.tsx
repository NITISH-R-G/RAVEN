import React, { useState } from "react";
import { 
  Sparkles, 
  Cpu, 
  Code, 
  Settings, 
  FileText, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  BookOpen, 
  ExternalLink,
  ShieldAlert,
  Sliders,
  HelpCircle,
  Network,
  RefreshCw
} from "lucide-react";

interface ManagedAgentBuilderProps {
  currentCaseSummary?: string;
  contradictionsCount?: number;
}

export const ManagedAgentBuilder: React.FC<ManagedAgentBuilderProps> = ({ 
  currentCaseSummary = "RAVEN Cross-doc coherence verification session.",
  contradictionsCount = 0
}) => {
  // Config state
  const [agentId, setAgentId] = useState("raven-coherence-auditor");
  const [description, setDescription] = useState("Automated underwriting auditor and relational anomaly processor.");
  const [systemInstruction, setSystemInstruction] = useState(
    `You are a senior banking forensics investigator running the RAVEN environment.
Your task is to analyze financial applicants, properties, and device footprints collectively.
Locate contradictions across documents (e.g., matching salary paystubs against tax form earnings), audit address matches, and flag synthetic corporate facades.
Always structure audit records with corresponding risk parameters.`
  );
  
  const [hasSlideSkill, setHasSlideSkill] = useState(true);
  const [hasCustomAgentsMd, setHasCustomAgentsMd] = useState(true);
  const [networkLockdown, setNetworkLockdown] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"js" | "python" | "curl">("js");
  const [copied, setCopied] = useState(false);

  // Simulation state
  const [userInput, setUserInput] = useState("Check if there are any colliding devices or template overlaps in the loaded case files.");
  const [simulationLogs, setSimulationLogs] = useState<{ role: "user" | "agent" | "system", text: string, timestamp: string }[]>([
    {
      role: "system",
      text: "Initialized remote antigravity-preview-05-2026 container. Ready to receive commands.",
      timestamp: "00:00:00"
    }
  ]);
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build the code samples dynamically based on user choices matching the Gemini API manual!
  const getJavaScriptCode = () => {
    return `import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

// Step 1: Create your saved managed agent on the Gemini platform
const agent = await client.agents.create({
    id: "${agentId}",
    base_agent: "antigravity-preview-05-2026",
    description: "${description}",
    system_instruction: "${systemInstruction.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    base_environment: {
        type: "remote",
        sources: [
            ${hasCustomAgentsMd ? `{
                type: "inline",
                target: ".agents/AGENTS.md",
                content: "Always check for coordinate EXIF discrepancies. Include relational cypher pathways in reports."
            },` : ""}
            ${hasSlideSkill ? `{
                type: "inline",
                target: ".agents/skills/presentation-exporter/SKILL.md",
                content: "---\\nname: presentation-exporter\\ndescription: Export beautiful HTML slides representing underwriting audits\\n---\\n# Underwriting Presentation Exporter\\nGenerate multi-screen visual decks with summary tables."
            },` : ""}
        ]${networkLockdown ? `,
        network: {
            allowlist: [
                { domain: "api.github.com" },
                { domain: "pypi.org" }
            ]
        }` : ""}
    }
});

// Step 2: Invoke your agent with custom input
const interaction = await client.interactions.create({
    agent: "${agentId}",
    input: "Analyze the uploaded case study and generate the executive slide deck.",
    environment: "remote"
}, { timeout: 300000 });

console.log("Forensic Output:", interaction.output_text);`;
  };

  const getPythonCode = () => {
    return `from google import genai

client = genai.Client()

# Step 1: Initialize custom platform Managed Agent
agent = client.agents.create(
    id="${agentId}",
    base_agent="antigravity-preview-05-2026",
    system_instruction="""${systemInstruction}""",
    base_environment={
        "type": "remote",
        "sources": [
            ${hasCustomAgentsMd ? `{
                "type": "inline",
                "target": ".agents/AGENTS.md",
                "content": "Always check for coordinate EXIF discrepancies. Include relational cypher pathways in reports."
            },` : ""}
            ${hasSlideSkill ? `{
                "type": "inline",
                "target": ".agents/skills/presentation-exporter/SKILL.md",
                "content": "---\\nname: presentation-exporter\\ndescription: Export HTML slide decks\\n---\\n# Exporter\\nGenerate interactive dashboard outlines.",
            },` : ""}
        ]${networkLockdown ? `,
        "network": {
            "allowlist": [
                {"domain": "api.github.com"},
                {"domain": "pypi.org"}
            ]
        }` : ""}
    }
)

print(f"Agent '{agent.id}' saved and persistent.")

# Step 2: Query the agent
result = client.interactions.create(
    agent="${agentId}",
    input="Analyze current case with 300 DPI parameters.",
    environment="remote"
)

print(result.output_text)`;
  };

  const getRESTCode = () => {
    return `curl -X POST "https://generativelanguage.googleapis.com/v1beta/agents" \\
  -H "Content-Type: application/json" \\
  -H "x-goog-api-key: $GEMINI_API_KEY" \\
  -H "Api-Revision: 2026-05-20" \\
  -d '{
    "id": "${agentId}",
    "base_agent": "antigravity-preview-05-2026",
    "description": "${description}",
    "system_instruction": "${systemInstruction.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    "base_environment": {
      "type": "remote",
      "sources": [
        ${hasCustomAgentsMd ? `{
          "type": "inline",
          "target": ".agents/AGENTS.md",
          "content": "Perform complete DFS/BFS path sweeps on device profiles."
        }` : ""}
      ]
    }
  }'`;
  };

  const currentCode = activeCodeTab === "js" 
    ? getJavaScriptCode() 
    : activeCodeTab === "python" 
    ? getPythonCode() 
    : getRESTCode();

  const handleRunSimulation = () => {
    if (!userInput.trim() || isSimulatingAgent) return;
    
    const userMsg = userInput;
    setUserInput("");
    setSimulationLogs(prev => [...prev, {
      role: "user",
      text: userMsg,
      timestamp: new Date().toLocaleTimeString()
    }]);

    setIsSimulatingAgent(true);

    setTimeout(() => {
      // Formulate a response reflecting the active parameters
      let simulatedResponse = "";
      if (userMsg.toLowerCase().includes("device") || userMsg.toLowerCase().includes("overlap")) {
        simulatedResponse = `[RAVEN Managed Agent Engine ID: ${agentId}] Running BFS traversal on environment variables...
Anomalies detected: ${contradictionsCount > 0 ? `${contradictionsCount} contradictions exist in active workspace files.` : "No clashing discrepancies uncovered."}
Running system_instruction constraint sweeps:
1. Target IP Check: Verified 100% DPI matches on uploaded items.
2. Device cross-collision check: Scanned active Fingerprint variables.

Recommendation: Proceed with immediate SEC/RBI risk classification logic on file logs. Ref: [AGENTS.md rulesets mapped].`;
      } else {
        simulatedResponse = `[RAVEN Managed Agent Engine ID: ${agentId}] Received query. Processing with custom system_instruction constraints.
Loaded inline resources:
* ${hasCustomAgentsMd ? "Mounted: /.agents/AGENTS.md (DF/BFS path instructions active)" : "No system AGENTS.md"}
* ${hasSlideSkill ? "Loaded Skill: /.agents/skills/presentation-exporter/SKILL.md shadow blocks" : "Standard general skills"}

Summary assessment target: "${currentCaseSummary.substring(0, 80)}..."
All verification nodes report green status for regulatory formatting parameters. Agent execution complete.`;
      }

      setSimulationLogs(prev => [...prev, {
        role: "agent",
        text: simulatedResponse,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsSimulatingAgent(false);
    }, 1200);
  };

  return (
    <div className="space-y-5 animate-fadeIn select-text">
      
      {/* Intro documentation box */}
      <div className="bg-[#161618] border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Layer 5: Developer Managed Agents Builder (Gemini API Integration)
        </h4>
        <p className="text-xs text-slate-400 leading-normal font-sans">
          Managed agents on the Gemini API let you extend the Antigravity agent with your custom instructions, skills, and templates. RAVEN lets you export active forensic logic, device parameters, and compliance filters as a fully persistent managed agent.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Left column: Setup Options (Grid size 5) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-[#101012] border border-white/5 p-4 rounded-xl space-y-4">
            <h5 className="text-[11px] font-mono font-bold text-slate-450 uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              Configure Agent Parameters
            </h5>

            {/* Agent ID Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Agent Identifier (Unique)`</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                placeholder="raven-auditor"
                className="w-full bg-[#0A0A0B] border border-white/5 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Agent Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of capability..."
                className="w-full bg-[#0A0A0B] border border-white/5 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/30"
              />
            </div>

            {/* System Instructions Prompt */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">System Instructions Prompt</label>
                <span className="text-[8px] font-mono text-indigo-400 bg-indigo-900/10 border border-indigo-900/20 px-1 py-0.5 rounded uppercase font-bold">Additive system_instruction</span>
              </div>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                rows={4}
                className="w-full bg-[#0A0A0B] border border-white/5 rounded p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/30 leading-relaxed font-sans resize-none"
              />
            </div>

            {/* Mounted file-based options described in building-managed-agents manual! */}
            <div className="space-y-2.5 pt-2 border-t border-white/5">
              <h6 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Environment Setup (Inline Sources)`</h6>
              
              <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={hasCustomAgentsMd}
                  onChange={(e) => setHasCustomAgentsMd(e.target.checked)}
                  className="mt-0.5 rounded border-white/5 bg-[#0A0A0B] text-indigo-650 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-mono text-[11px] text-slate-300 block font-semibold leading-none">Mount .agents/AGENTS.md</span>
                  <span className="text-[9.5px] text-slate-500 block leading-normal mt-0.5">Appends long-form, version-controlled directives onto agent startup lifecycle.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={hasSlideSkill}
                  onChange={(e) => setHasSlideSkill(e.target.checked)}
                  className="mt-0.5 rounded border-white/5 bg-[#0A0A0B] text-indigo-650 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-mono text-[11px] text-slate-300 block font-semibold leading-none">Assemble presentation-exporter skill</span>
                  <span className="text-[9.5px] text-slate-500 block leading-normal mt-0.5">Automatically registers high-fidelity presentation exporter .agents/skills/ exporter.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={networkLockdown}
                  onChange={(e) => setNetworkLockdown(e.target.checked)}
                  className="mt-0.5 rounded border-white/5 bg-[#0A0A0B] text-indigo-650 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-mono text-[11px] text-slate-300 block font-semibold leading-none">Strict Network Allowlist</span>
                  <span className="text-[9.5px] text-slate-500 block leading-normal mt-0.5">Enforces strict sandbox lockdowns - limiting access to GitHub API & PyPI imports.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right column: Code view and interactive test playground (Grid size 7) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          
          {/* Section: Saved Code export tabs */}
          <div className="bg-[#101012] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-2.5">
              <h5 className="text-[11px] font-mono font-bold text-slate-450 uppercase flex items-center gap-1.5 shrink-0">
                <Code className="w-4 h-4 text-indigo-400 shrink-0" />
                Gemini SDK Playbook Snippet
              </h5>

              {/* Code format control toggle */}
              <div className="flex bg-black/60 border border-white/5 rounded p-0.5 text-[9.5px] font-mono font-bold uppercase shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setActiveCodeTab("js")}
                  className={`px-2.5 py-1 rounded transition-all ${activeCodeTab === "js" ? "bg-indigo-600/15 text-indigo-350 border border-indigo-500/25" : "text-slate-500"}`}
                >
                  Javascript SDK
                </button>
                <button
                  onClick={() => setActiveCodeTab("python")}
                  className={`px-2.5 py-1 rounded transition-all ${activeCodeTab === "python" ? "bg-indigo-600/15 text-indigo-350 border border-indigo-500/25" : "text-slate-500"}`}
                >
                  Python SDK
                </button>
                <button
                  onClick={() => setActiveCodeTab("curl")}
                  className={`px-2.5 py-1 rounded transition-all ${activeCodeTab === "curl" ? "bg-indigo-600/15 text-indigo-350 border border-indigo-500/25" : "text-slate-500"}`}
                >
                  REST API
                </button>
              </div>
            </div>

            {/* Generated Code Window with copy capability */}
            <div className="relative group">
              <pre className="bg-black/90 p-3.5 rounded-lg border border-white/5 overflow-x-auto text-[10.5px] font-mono text-indigo-300 leading-relaxed max-h-[220px]">
                <code>{currentCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(currentCode)}
                className="absolute top-2.5 right-2.5 bg-[#161618] hover:bg-[#202022] border border-white/10 rounded p-1.5 transition-all text-slate-300"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-sans italic flex items-center gap-1 leading-normal">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Tip: The code matches the official @google/genai Node.js SDK specifications loaded at interaction lifecycle.
            </p>
          </div>

          {/* Interactive Agent Turn Simulator */}
          <div className="bg-[#101012] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            <h5 className="text-[11px] font-mono font-bold text-slate-450 uppercase flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
              Interactive Managed Agentic Playground
            </h5>

            {/* Interactive dialogue log */}
            <div className="flex-1 bg-black/50 border border-white/5 rounded-lg p-3 space-y-3 min-h-[160px] max-h-[220px] overflow-y-auto">
              {simulationLogs.map((log, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${
                      log.role === "system" ? "text-indigo-400" : log.role === "user" ? "text-slate-400" : "text-emerald-400"
                    }`}>
                      {log.role === "system" && "⚙️ Core Platform"}
                      {log.role === "user" && `👤 Local Tester`}
                      {log.role === "agent" && `🤖 AI Ingestion Agent: [${agentId}]`}
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-650">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-black/25 p-2 rounded border border-white/5">{log.text}</p>
                </div>
              ))}
              
              {isSimulatingAgent && (
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-mono animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Traversing sandbox file structures with LLaMA attention matrices...</span>
                </div>
              )}
            </div>

            {/* Dialog input field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunSimulation()}
                placeholder="Talk to your Custom Managed Agent (e.g., 'Verify files...')"
                className="flex-1 bg-[#0A0A0B] border border-white/5 rounded p-2 text-xs focus:outline-none focus:border-indigo-500/30"
              />
              <button
                onClick={handleRunSimulation}
                disabled={!userInput.trim() || isSimulatingAgent}
                className="bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-800 border border-indigo-500/25 px-4 font-mono font-bold text-xs uppercase text-white rounded transition flex items-center gap-1.5 relative overflow-hidden"
              >
                <Play className="w-3 h-3 text-indigo-200" />
                Query
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
