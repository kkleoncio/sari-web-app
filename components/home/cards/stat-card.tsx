type StatCardGlassProps = {
  label: string;
  value: string;
};

export function StatCardGlass({ label, value }: StatCardGlassProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/14 p-4 backdrop-blur-xl shadow-[0_8px_20px_rgba(2,48,48,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,255,255,0.10)_45%,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-2xl border border-white/20" />

      <div className="relative z-10">
        <p className="font-helvetica text-xs font-light text-[#023030]/60">
          {label}
        </p>
        <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
          {value}
        </p>
      </div>
    </div>
  );
}