"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  Store,
  NotebookText,
  History,
  Users,
  LogOut,
  UserCircle2,
  ChevronUp,
  ChevronRight,
  PanelLeftClose,
} from "lucide-react";
import type { NavKey } from "@/app/home/types";
import { LogoutConfirmationModal } from "@/components/home/modals/logout-confirmation-modal";

type SidebarLinkProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
};

function SidebarLink({
  icon: Icon,
  label,
  active,
  collapsed = false,
  onClick,
}: SidebarLinkProps) {
  return (
    <li className="list-none">
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className={`group flex w-full items-center rounded-xl text-left transition ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.10))] text-white shadow-[0_8px_24px_rgba(2,48,48,0.14)] backdrop-blur-xl"
              : "border border-transparent text-white/80 hover:border-white/12 hover:bg-white/8 hover:text-white"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
              active
                ? "bg-white text-[#023030]"
                : "bg-white/10 text-white/90 group-hover:bg-white/14"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <p
                  className={`font-poppins whitespace-nowrap text-[14px] ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && active && (
            <span className="h-2 w-2 rounded-full bg-[#ccffe8] shadow-[0_0_14px_rgba(204,255,232,0.9)]" />
          )}
        </button>
      </div>
    </li>
  );
}

type AccountMenuButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

function AccountMenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: AccountMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        danger
          ? "text-white/78 hover:bg-white/8 hover:text-white"
          : "text-white/88 hover:bg-white/8 hover:text-white"
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/85 transition group-hover:bg-white/14">
        <Icon className="h-4 w-4" />
      </span>

      <span className="font-poppins flex-1 text-[13px] font-medium">
        {label}
      </span>

      {!danger && (
        <ChevronRight className="h-4 w-4 text-white/35 transition group-hover:text-white/60" />
      )}
    </button>
  );
}

type ExactSidebarProps = {
  active: NavKey;
  onChange: (value: NavKey) => void;
};

export function ExactSidebar({ active, onChange }: ExactSidebarProps) {
  const router = useRouter();
  const [openLogoutModal, setOpenLogoutModal] = React.useState(false);
  const [openAccountMenu, setOpenAccountMenu] = React.useState(false);

  const [collapsed, setCollapsed] = React.useState(false);

  const accountRef = React.useRef<HTMLDivElement | null>(null);

  const [firstName, setFirstName] = React.useState("Student");

  React.useEffect(() => {
    const storedFirstName = localStorage.getItem("firstName");
    if (storedFirstName?.trim()) {
      setFirstName(storedFirstName);
    }
  }, []);

  React.useEffect(() => {
  const saved = localStorage.getItem("sariSidebarCollapsed");
  if (saved !== null) {
    setCollapsed(saved === "true");
  }
}, []);

  React.useEffect(() => {
    localStorage.setItem("sariSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setOpenAccountMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (collapsed) {
      setOpenAccountMenu(false);
    }
  }, [collapsed]);

  const handleConfirmLogout = async () => {
    localStorage.removeItem("manualMealPlan");
    localStorage.removeItem("currentPlanSource");
    localStorage.removeItem("currentBudget");
    localStorage.removeItem("firstName");
    localStorage.removeItem("userEmail");

    setOpenLogoutModal(false);

    await signOut({ redirectTo: "/auth/login" });
  };

  const initial = firstName.trim().charAt(0).toUpperCase() || "S";

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 92 : 250 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => {
          if (collapsed) setCollapsed(false);
        }}
        className={`relative flex h-screen shrink-0 flex-col overflow-hidden py-5 text-white backdrop-blur-xl ${
          collapsed ? "px-3" : "px-5"
        }`}
        style={{
          background: `
            radial-gradient(circle at 20% 0%, rgba(204,255,232,0.12) 0%, rgba(204,255,232,0) 28%),
            radial-gradient(circle at 80% 18%, rgba(227,242,253,0.14) 0%, rgba(227,242,253,0) 24%),
            linear-gradient(180deg, #022b2b 0%, #023636 35%, #024949 70%, #055c5c 100%)
          `,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.00)_70%)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[1px] bg-white/10" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center ${
                collapsed ? "w-full justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <Image
                  src="/sari-logo-yellow.png"
                  alt="SARI logo"
                  width={45}
                  height={45}
                  className="object-contain"
                />
              </div>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden whitespace-nowrap text-[20px] font-semibold tracking-tight text-white"
                  >
                    sari
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => {
                    setCollapsed(true);
                    setOpenAccountMenu(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 backdrop-blur-md transition hover:bg-white/14 hover:text-white"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <nav className="mt-7 flex-1">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mb-3 overflow-hidden px-2"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Navigation
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <ul className="m-0 space-y-2 p-0">
              <SidebarLink
                icon={LayoutDashboard}
                label="Dashboard"
                active={active === "dashboard"}
                collapsed={collapsed}
                onClick={() => onChange("dashboard")}
              />
              <SidebarLink
                icon={Store}
                label="Establishments"
                active={active === "establishments"}
                collapsed={collapsed}
                onClick={() => onChange("establishments")}
              />
              <SidebarLink
                icon={NotebookText}
                label="Menu"
                active={active === "menu"}
                collapsed={collapsed}
                onClick={() => onChange("menu")}
              />
              <SidebarLink
                icon={History}
                label="History"
                active={active === "history"}
                collapsed={collapsed}
                onClick={() => onChange("history")}
              />
              <SidebarLink
                icon={Users}
                label="Community"
                active={active === "community"}
                collapsed={collapsed}
                onClick={() => onChange("community")}
              />
            </ul>
          </nav>

          <div className="mt-6" ref={accountRef}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mb-2 overflow-hidden px-2"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Account
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              {!collapsed && openAccountMenu && (
                <div className="absolute bottom-[calc(100%+10px)] left-0 right-0 rounded-[22px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] p-2 shadow-[0_18px_40px_rgba(2,48,48,0.22)] backdrop-blur-2xl">
                  <AccountMenuButton
                    icon={UserCircle2}
                    label="View profile"
                    onClick={() => {
                      setOpenAccountMenu(false);
                      router.push("/home/profile");
                    }}
                  />

                  <AccountMenuButton
                    icon={LogOut}
                    label="Log out"
                    danger
                    onClick={() => {
                      setOpenAccountMenu(false);
                      setOpenLogoutModal(true);
                    }}
                  />
                </div>
              )}

              {collapsed ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/10 px-3.5 py-3 backdrop-blur-md transition hover:bg-white/14"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(227,242,253,0.88),rgba(204,255,232,0.92))] text-[#023030] shadow-[0_8px_18px_rgba(255,255,255,0.14)]">
                      <span className="font-poppins text-[14px] font-semibold">
                        {initial}
                      </span>
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpenAccountMenu((prev) => !prev)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-3.5 py-3 text-left backdrop-blur-md transition hover:bg-white/14"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(227,242,253,0.88),rgba(204,255,232,0.92))] text-[#023030] shadow-[0_8px_18px_rgba(255,255,255,0.14)]">
                    <span className="font-poppins text-[14px] font-semibold">
                      {initial}
                    </span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-poppins truncate text-[14px] font-medium text-white">
                      {firstName}
                    </p>
                    <p className="text-[12px] text-white/58">View account</p>
                  </div>

                  <ChevronUp
                    className={`h-4 w-4 text-white/45 transition duration-200 ${
                      openAccountMenu ? "rotate-0 text-white/70" : "rotate-180"
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      <LogoutConfirmationModal
        open={openLogoutModal}
        onOpenChange={setOpenLogoutModal}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}