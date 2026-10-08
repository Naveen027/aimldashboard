import { useState } from "react";
import {
    Bot,
    FileSearch,
    Fingerprint,
    Languages,
    MessageSquareText,
    ScanFace,
    type LucideIcon,
} from "lucide-react";
import { type AiModelDefinition } from "../data/aiModels";

const modelIcons: Record<string, LucideIcon> = {
    "kartavya-face-matching": ScanFace,
    "muzzle-print-identification": Fingerprint,
    "grievance-management": MessageSquareText,
    "government-order-information": FileSearch,
    "ai-enabled-chatbots": Bot,
    "kannada-kasthuri": Languages,
};

interface AiModelCardProps {
    model: AiModelDefinition;
}

function AiModelCard({ model }: AiModelCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const ModelIcon = modelIcons[model.id];

    return (
        <>
        <div className="mb-6 w-full px-3 min-[768px]:w-1/2 min-[992px]:w-1/3">
            <div className="flex min-h-[220px] flex-col rounded-2xl !border !border-[#eef0f4] bg-white p-5 text-[#1c2033] shadow-[0_1px_3px_rgba(20,30,60,0.08)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:!border-[#3d7bfc] hover:shadow-[0_8px_20px_rgba(20,30,60,0.1)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937] [.theme-dark_&]:text-[#f3f4f6]">
                <div className="mb-[5px] flex items-center gap-3.5">
                    <div className="grid h-[58px] w-14 shrink-0 place-items-center rounded-[10px] bg-[#eef4ff] text-[#3d7bfc] max-[576px]:size-12 [.theme-dark_&]:bg-[#273449]">
                        <ModelIcon size={26} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h5 className="m-0 text-base font-bold text-[#2c3e50] max-[768px]:text-sm max-[576px]:text-[13px] [.theme-dark_&]:text-[#f3f4f6]">
                            {model.name}
                        </h5>
                        <p className="m-0 mt-1 text-xs text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">
                            {model.category}
                        </p>
                    </div>
                </div>
                <p className="mb-[5px] mt-0 min-h-0 flex-1 overflow-y-auto text-[13px] leading-[1.6] text-[#5f6b7a] max-[576px]:text-xs [.theme-dark_&]:text-[#c1c8d3]">{model.description}</p>
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {model.highlights.map((highlight) => (
                        <span
                            key={highlight}
                            className="rounded-full bg-[#eef4ff] px-2 py-1 text-[11px] font-medium text-[#3d5fa8] [.theme-dark_&]:bg-[#273449] [.theme-dark_&]:text-[#c1d2f5]"
                        >
                            {highlight}
                        </span>
                    ))}
                </div>
                <div className="mb-0">
                    <p className="m-0 flex items-center gap-2 text-[13px] text-[#5f6b7a] [.theme-dark_&]:text-[#c1c8d3]">
                        Status:{" "}
                        <span className="inline-block rounded bg-[#e8f5f3] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#1ba098] [.theme-dark_&]:bg-emerald-500/15 [.theme-dark_&]:text-emerald-300">
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
                    <div className="mb-3 flex flex-wrap gap-2">
                        {model.highlights.map((highlight) => (
                            <span
                                key={highlight}
                                className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-medium text-[#3d5fa8] [.theme-dark_&]:bg-[#273449] [.theme-dark_&]:text-[#c1d2f5]"
                            >
                                {highlight}
                            </span>
                        ))}
                    </div>
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