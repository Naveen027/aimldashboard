import { useState } from "react";

export interface AiModel {
    name: string;
    category: string;
    description: string;
    icon: string;
}

export const aiModels: AiModel[] = [
    {
        name: "GPT-4",
        category: "Text Generation",
        icon: "💬",
        description:
            "Advanced natural language processing to understand natural language, prompts, and personalized responses.",
    },
    {
        name: "DALL-E 3",
        category: "Image Generation",
        icon: "🖌️",
        description:
            "Generate creative images from text prompts to produce imaginative and visually appealing images.",
    },
    {
        name: "Whisper",
        category: "Speech-to-Text",
        icon: "🎙️",
        description:
            "Convert audio to text accurately to convert customer calls, conversations, and recordings.",
    },
    {
        name: "Codex",
        category: "Code Assistance",
        icon: "</>",
        description:
            "Generate code snippets and debug, optimize, and improve code across different programming languages.",
    },
    {
        name: "Stable Diffusion",
        category: "Open-Source Image",
        icon: "📷",
        description:
            "Customizable image generation to customize your image editors and filters with creative outputs.",
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
                <div className="model-heading">
                    <div className="model-icon">
                        <span>{model.icon}</span>
                    </div>
                    <h5 className="model-name">
                        {model.name}{" "}
                        <span className="model-category">
                            ({model.category.toLowerCase()})
                        </span>
                    </h5>
                </div>
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
                    className="btn btn-view-details"
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