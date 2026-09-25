export interface AiModel {
    name: string;
    category: string;
    description: string;
}

export const aiModels: AiModel[] = [
    {
        name: "GPT-4",
        category: "Text Generation",
        description:
            "Advanced language generation for writing, analysis, and conversation.",
    },
    {
        name: "DALL-E 3",
        category: "Image Generation",
        description:
            "Create detailed images from natural language descriptions.",
    },
    {
        name: "Whisper",
        category: "Speech-to-Text",
        description:
            "Transcribe spoken audio accurately into written text.",
    },
    {
        name: "Codex",
        category: "Code Assistance",
        description:
            "Generate, explain, and improve code across popular languages.",
    },
    {
        name: "Stable Diffusion",
        category: "Open-Source Image",
        description:
            "Generate creative images with a flexible open-source model.",
    },
];

interface AiModelCardProps {
    model: AiModel;
}

function AiModelCard({ model }: AiModelCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
        <div className="col-md-6 col-lg-4 mb-4">
            <div className="model-card">
                <div className="model-icon">
                    <span>🤖</span>
                </div>
                <h5 className="model-name">{model.name}</h5>
                <p className="model-category">{model.category}</p>
                <p className="model-description">{model.description}</p>
                <div className="model-status">
                    <p className="status-badge">
                        Status:{" "}
                        <span className="badge-available">
                            Available
                        </span>
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-view-details w-100"
                    onClick={() => setIsModalOpen(true)}
                >
                    View Details
                </button>
            </div>
        </div>
        {isModalOpen && (
            <div
                className="model-modal-backdrop"
                role="presentation"
                onClick={() => setIsModalOpen(false)}
            >
                <article
                    className="model-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`${model.name}-details`}
                    onClick={(event) => event.stopPropagation()}
                >
                    <button
                        type="button"
                        className="model-modal-close"
                        aria-label="Close model details"
                        onClick={() => setIsModalOpen(false)}
                    >
                        ×
                    </button>
                    <h2 id={`${model.name}-details`}>
                        {model.name}
                    </h2>
                    <p className="model-modal-category">
                        {model.category}
                    </p>
                    <p>{model.description}</p>
                    <p>
                        Status:{" "}
                        <strong>Available</strong>
                    </p>
                    <p>
                        This model is available for your account
                        and ready to use.
                    </p>
                </article>
            </div>
        )}
        </>
    );
}

export default AiModelCard;
import { useState } from "react";
