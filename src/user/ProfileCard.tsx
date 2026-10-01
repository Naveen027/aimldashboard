interface ProfileCardProps {
    label: string;
    value: string;
}

function ProfileCard({ label, value }: ProfileCardProps) {
    return (
        <div className="mb-2 w-full px-3 md:w-1/3">
            <div className="rounded-lg border border-[#e0e6ed] bg-white p-2.5 text-[#2c3e50] shadow-[0_10px_9px_rgba(0,0,0,0.08)] transition-all duration-300 [.theme-dark_&]:border-[#374151] [.theme-dark_&]:bg-[#1f2937]">
                <h6 className="mb-0 text-xs font-semibold uppercase tracking-[0.5px] text-[#5f6b7a] [.theme-dark_&]:text-[#c1c8d3]">{label}</h6>
                <p
                    className={`m-0 text-lg font-semibold ${
                        value === "Active" ? "text-[#1ba098]" : "text-black [.theme-dark_&]:text-white"
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

export default ProfileCard;