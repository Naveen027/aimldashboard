import { useState } from "react";
import codexImage from "../assets/codex.jpeg";
import dalleImage from "../assets/dalle.jpeg";
import gptImage from "../assets/gpt.jpeg";
import stableImage from "../assets/stable.jpeg";
import whisperImage from "../assets/whisper.jpeg";

export interface AiModel {
    name: string;
    category: string;
    description: string;
    image: string;
}

export const aiModels: AiModel[] = [
    {
        name: "GPT-4",
        category: "Text Generation",
        image: gptImage,
        description:
            "Advanced natural language processing to understand natural language, prompts, and personalized responses.",
    },
    {
        name: "DALL-E 3",
        category: "Image Generation",
        image: dalleImage,
        description:
            "Generate creative images from text prompts to produce imaginative and visually appealing images.",
    },
    {
        name: "Whisper",
        category: "Speech-to-Text",
        image: whisperImage,
        description:
            "Convert audio to text accurately to convert customer calls, conversations, and recordings.",
    },
    {
        name: "Codex",
        category: "Code Assistance",
        image: codexImage,
        description:
            "Generate code snippets and debug, optimize, and improve code across different programming languages.",
    },
    {
        name: "Stable Diffusion",
        category: "Open-Source Image",
        image: stableImage,
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
        <div className="mb-6 w-full px-3 min-[768px]:w-1/2 min-[992px]:w-1/3">
            <div className="flex min-h-[220px] flex-col rounded-2xl !border !border-[#eef0f4] bg-white p-5 text-[#1c2033] shadow-[0_1px_3px_rgba(20,30,60,0.08)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:!border-[#3d7bfc] hover:shadow-[0_8px_20px_rgba(20,30,60,0.1)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937] [.theme-dark_&]:text-[#f3f4f6]">
                <div className="mb-[5px] flex items-center gap-3.5">
                    <div className="h-[58px] w-14 shrink-0 overflow-hidden rounded-[10px] max-[576px]:size-12">
                        <img className="block h-[85%] w-[85%] rounded-[15px] object-cover" src={model.image} alt="" />
                    </div>
                    <h5 className="m-0 text-base font-bold text-[#2c3e50] max-[768px]:text-sm max-[576px]:text-[13px] [.theme-dark_&]:text-[#f3f4f6]">
                        {model.category}
                    </h5>
                </div>
                <p className="mb-[5px] mt-0 min-h-0 flex-1 overflow-y-auto text-[13px] leading-[1.6] text-[#5f6b7a] max-[576px]:text-xs [.theme-dark_&]:text-[#c1c8d3]">{model.description}</p>
                <div className="mb-0">
                    <p className="m-0 flex items-center gap-2 text-[13px] text-[#5f6b7a] [.theme-dark_&]:text-[#c1c8d3]">
                        Status:{" "}
                        <span className="inline-block rounded bg-[#e8f5f3] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#1ba098]">
                            Available
                        </span>
                    </p>
                </div>
                <button
                    type="button"
                    className="mt-auto w-auto self-end cursor-pointer rounded-lg border-0 bg-[#3d7bfc] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#3269dc] focus:outline-none focus:ring-2 focus:ring-[#3d7bfc]/30 active:translate-y-px"
                    onClick={() => setIsModalOpen(true)}
                >
                    View Details
                </button>
            </div>
        </div>
        {isModalOpen && (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.62)] p-6"
                role="presentation"
                onClick={() => setIsModalOpen(false)}
            >
                <article
                    className="relative w-full max-w-[520px] rounded-xl border border-[#e0e6ed] bg-white p-[15px] text-[#2c3e50] shadow-[0_18px_50px_rgba(0,0,0,0.25)] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:bg-[#1f2937] [.theme-dark_&]:text-[#f3f4f6]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`${model.name}-details`}
                    onClick={(event) => event.stopPropagation()}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-3 cursor-pointer border-0 bg-transparent text-[28px] leading-none text-[#5f6b7a] hover:text-[#2c3e50] focus:outline-none [.theme-dark_&]:text-[#c1c8d3] [.theme-dark_&]:hover:text-white"
                        aria-label="Close model details"
                        onClick={() => setIsModalOpen(false)}
                    >
                        ×
                    </button>
                    <h2 className="mb-2" id={`${model.name}-details`}>
                        {model.name}
                    </h2>
                    <p className="font-semibold text-[#1ba098]">
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