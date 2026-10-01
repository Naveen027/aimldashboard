import { NavLink } from "react-router-dom";
import seal from "../assets/Seal_of_Karnataka.svg";
import logoutImage from "../assets/logout.png";
import dashboardImage from "../assets/dashboard.png";
import myProfileImage from "../assets/myprofile.png";
import apiKeyImage from "../assets/apikey.png";
import billingImage from "../assets/billing.png";
import supportImage from "../assets/support.png";

interface NavItem {
    label: string;
    icon: string;
    to: string;
    end?: boolean;
}

interface UserSidebarProps {
    userName: string;
    onLogout: () => void;
}

const navItems: NavItem[] = [
    { label: "Dashboard", icon: dashboardImage, to: "/user-dashboard", end: true },
    { label: "My Profile", icon: myProfileImage, to: "/my-profile", end: true },
    { label: "API Keys", icon: apiKeyImage, to: "/api-keys" },
    { label: "Billing", icon: billingImage, to: "/billing" },
    { label: "Support", icon: supportImage, to: "/support" },
];

function UserSidebar({ userName, onLogout }: UserSidebarProps) {
    return (
        <aside className="fixed left-0 top-0 z-30 h-screen w-[260px] shrink-0 overflow-y-auto bg-[#131b2e] p-0 text-[#cfd3e0] max-[991px]:w-[240px] max-[767px]:hidden">
            {/* Brand */}
            <div className="flex h-[54px] items-center gap-2 border-b border-white/10 px-2.5">
                <img
                    className="h-10 w-10 shrink-0 object-contain"
                    src={seal}
                    alt="Seal of Karnataka"
                />
                <span className="m-0 flex min-w-0 items-center gap-2 whitespace-nowrap text-[15px] font-bold tracking-[-0.03em] text-white">
                    KARNATAKA AI CELL
                </span>
            </div>

            {/* Navigation */}
            <nav aria-label="Main navigation" className="py-5">
                <ul className="m-0 flex list-none flex-col p-0">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `group !mx-3 !my-1 !flex !w-[calc(100%-24px)] !items-center !gap-3 !rounded-lg !border-0 !px-5 !py-3 !text-sm !font-medium !no-underline !outline-none transition-colors duration-300 hover:!bg-white/10 hover:!text-white focus:!bg-white/10 focus:!text-white motion-reduce:transition-none ${
                                        isActive
                                            ? "!bg-white/10 !text-white"
                                            : "!bg-transparent !text-white/70"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <img
                                            className={`h-5 w-5 shrink-0 object-contain brightness-0 invert transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 ${
                                                isActive ? "opacity-100" : "opacity-70"
                                            }`}
                                            src={item.icon}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="mt-3 border-t border-white/[0.08] px-5 pb-[5px] pt-4">
                <div className="mb-2 flex items-center gap-2 px-2 py-1.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-[#23262f]">
                        {userName.charAt(0).toUpperCase()}
                    </span>
                    <span className="break-words text-[0.85rem] font-medium text-[#e5e7f0]">
                        {userName}
                    </span>
                </div>
                <a
                    href="/"
                    className="!inline-flex !items-center !gap-2 !px-2 !py-1.5 !text-[0.85rem] !font-normal !text-[#aeb4c7] !no-underline !transition-colors !duration-200 hover:!text-white focus:!text-white focus:!outline-none"
                    onClick={(event) => {
                        event.preventDefault();
                        onLogout();
                    }}
                >
                    <span className="flex w-[18px] shrink-0 items-center">
                        <img
                            className="h-[18px] w-[18px] object-contain brightness-0 invert"
                            src={logoutImage}
                            alt=""
                            aria-hidden="true"
                        />
                    </span>
                    <span>Logout</span>
                </a>
            </div>
        </aside>
    );
}

export default UserSidebar;