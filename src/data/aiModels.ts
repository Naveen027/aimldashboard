export type AiModelType = "llm" | "vision" | "embedding" | "other";

export interface AiModelDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  type: AiModelType;
}

export const aiModelCatalog: AiModelDefinition[] = [
  {
    id: "kartavya-face-matching",
    name: "Face Matching as a Service",
    category: "KARTAVYA",
    description: `Karnataka Advanced Attendance Management System.

Key Capabilities:
- Template management
- Liveness detection
- Scalability for high-throughput sites
- Audit trails for compliance

Integration & Deployment:
- Containerised microservices and standard APIs enable integration with existing identity and HR systems
- Support for on-premise and government cloud deployments

Governance & Safeguards:
- Privacy-first principles – data minimisation, configurable retention, consent management
- Cryptographic storage of biometric templates
- Operational guidelines to ensure lawful, ethical use

Outcome:
- Reduces manual verification overhead
- Strengthens fraud prevention
- Provides verifiable attendance records for audit and programme management`,
    highlights: ["99.8% Accuracy", "Fraud prevention"],
    type: "vision",
  },

  {
    id: "muzzle-print-identification",
    name: "AI-Based Muzzle Print Identification",
    category: "Livestock Management",
    description: `Livestock Management with real-time pattern recognition and identification.

Key Capabilities:
- High-precision pattern extraction
- Match-scoring with confidence intervals
- Offline image capture support
- Provenance metadata

Integration & Deployment:
- Mobile-first capture apps with asynchronous upload
- APIs for integration with livestock registries and veterinary management systems

Governance & Safeguards:
- Consent protocols for owners
- Anonymised analytics for large-scale surveillance
- Guidelines for ethical deployment to prevent misuse

Outcome:
- Improves traceability
- Streamlines beneficiary verification
- Enhances effectiveness of livestock health and subsidy programmes`,
    highlights: ["Biometric", "Livestock Tracking"],
    type: "vision",
  },

  {
    id: "grievance-management",
    name: "AI-Based Grievance Management",
    category: "Grievance Management",
    description: `Intelligent system for tracking and resolving issues with 95% accuracy.

Key Capabilities:
- Multi-channel intake (web, mobile, email)
- Automated categorisation
- Sentiment and severity analysis
- SLA tracking and escalation workflows

Integration & Deployment:
- Connectors for existing grievance portals and e-governance backends
- Role-based access controls for departmental users

Governance & Safeguards:
- Transparent decision logs
- Explainability modules for automated triage
- Procedural controls to ensure human oversight of sensitive cases

Outcome:
- Accelerates resolution times
- Improves transparency for citizens
- Provides leaders with actionable metrics to close systemic governance gaps`,
    highlights: ["v3.2.1"],
    type: "llm",
  },

  {
    id: "government-order-information",
    name: "Government Order Information Tool",
    category: "Government Documents",
    description: `Automated extraction and summarization of critical government documents.

Key Capabilities:
- Named-entity recognition
- Clause extraction
- Semantic search
- Auto-summarisation
- Cross-document linkage

Integration & Deployment:
- Ingest pipelines for PDF/HTML/Word formats
- Search APIs for portal integration
- Exportable briefings for decision makers

Governance & Safeguards:
- Provenance tagging
- Redaction workflows for sensitive content
- Explicit audit logs for every extraction and summary

Outcome:
- Reduces manual document processing time
- Improves compliance monitoring
- Enables faster policy implementation through precise information delivery`,
    highlights: ["99% Accuracy", "Analyzer", "Management"],
    type: "other",
  },

  {
    id: "ai-enabled-chatbots",
    name: "AI-Enabled Chatbots",
    category: "Conversational AI",
    description: `Autonomous AI chatbots that learn and adapt in real-world environments.

Key Capabilities:
- Intent detection
- Slot-filling
- Contextual session management
- Fallback escalation
- Analytics for continuous improvement

Integration & Deployment:
- Lightweight SDKs for web and mobile channels
- Connectors to government databases and service APIs
- Secure authentication hooks for personalised services

Governance & Safeguards:
- Built-in content governance
- Logs for human review
- Configurable response policies to prevent misinformation and preserve privacy

Outcome:
- Improves citizen access to services
- Reduces call-centre load
- Standardises responses while preserving escalation paths for complex cases`,
    highlights: ["Multi-lingual", "LLM-powered"],
    type: "llm",
  },

  {
    id: "kannada-kasthuri",
    name: "Kannada Kasthuri",
    category: "Kannada Translation",
    description: `Kannada Kasthuri delivers superior English-to-Kannada translation quality.

Key Capabilities:
- Domain-aware translation
- Speech-to-text and text-to-speech modules
- Named-entity preservation
- Domain fine-tuning for legal and administrative language

Integration & Deployment:
- On-prem or secure cloud API endpoints for portals, chatbots and document pipelines
- Model-update lifecycle management for continuous improvement

Governance & Safeguards:
- Bias-mitigation processes
- Community validation loops
- Clear provenance of machine translations to support human review

Outcome:
- Expands accessibility of government services in Kannada
- Improves communication with regional stakeholders
- Reduces lag in multilingual policy dissemination

Request Demo
Technical Documentation
Case Studies`,
    highlights: ["Context-aware", "Multi-domain"],
    type: "llm",
  },
];