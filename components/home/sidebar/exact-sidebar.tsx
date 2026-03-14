"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  NotebookText,
  History,
  Users,
  LogOut,
} from "lucide-react";
import type { NavKey } from "@/app/home/types";

type SidebarLinkProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function SidebarLink({
  icon: Icon,
  label,
  active,
  onClick,
}: SidebarLinkProps) {
  if (active) {
    return (
      <li className="relative list-none">
        <button
          type="button"
          onClick={onClick}
          className="relative flex h-[65px] w-full items-center rounded-l-full bg-[#FAFAFA] pl-5 pr-4 text-[#023030]"
        >
          <span className="absolute -top-[30px] right-0 h-[30px] w-[30px] bg-transparent">
            <span className="absolute inset-0 rounded-br-[30px] shadow-[10px_10px_0_10px_#FAFAFA]" />
          </span>

          <span className="absolute -bottom-[30px] right-0 h-[30px] w-[30px] bg-transparent">
            <span className="absolute inset-0 rounded-tr-[30px] shadow-[10px_-10px_0_10px_#FAFAFA]" />
          </span>

          <span className="relative z-10 -ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#023030] text-white">
            <Icon className="h-[18px] w-[18px]" />
          </span>

          <span className="font-poppins relative z-10 ml-4 text-[16px] font-semibold">
            {label}
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onClick}
        className="flex h-[60px] w-full items-center pl-10 pr-4 text-white/95"
      >
        <Icon className="h-[18px] w-[18px]" />
        <span className="font-poppins ml-4 text-[16px] font-normal">
          {label}
        </span>
      </button>
    </li>
  );
}

type ExactSidebarProps = {
  active: NavKey;
  onChange: (value: NavKey) => void;
};

export function ExactSidebar({ active, onChange }: ExactSidebarProps) {
  const router = useRouter();
  return (
    <aside
      className="flex h-screen w-[250px] flex-col overflow-visible pl-5 text-white"
      style={{
        background: `
          radial-gradient(circle at 50% 78%, rgba(0, 170, 170, 0.18) 0%, rgba(0, 170, 170, 0) 34%),
          linear-gradient(180deg, #022b2b 0%, #023636 28%, #024949 62%, #066d6d 100%)
        `,
      }}
    >
      <div className="relative h-[128px]">
        <div className="px-10 pt-8">
          <span className="text-[34px] font-bold leading-none text-white">
            S
          </span>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="m-0 p-0">
          <SidebarLink
            icon={LayoutDashboard}
            label="Dashboard"
            active={active === "dashboard"}
            onClick={() => onChange("dashboard")}
          />
          <SidebarLink
            icon={Store}
            label="Establishments"
            active={active === "establishments"}
            onClick={() => onChange("establishments")}
          />
          <SidebarLink
            icon={NotebookText}
            label="Menu"
            active={active === "menu"}
            onClick={() => onChange("menu")}
          />
          <SidebarLink
            icon={History}
            label="History"
            active={active === "history"}
            onClick={() => onChange("history")}
          />
          <SidebarLink
            icon={Users}
            label="Community"
            active={active === "community"}
            onClick={() => onChange("community")}
          />
        </ul>
      </nav>

      <div className="pb-8 pl-10">
        <button
          onClick={() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("isLoggedIn");
            router.push("/auth/login");
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}