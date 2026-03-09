type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-4 py-7 text-white shadow-[0_10px_24px_rgba(2,48,48,0.18)]">
      <p className="font-helvetica text-sm font-light text-white">{label}</p>
      <p className="mt-0 text-[18px] font-semibold sm:text-[35px]">{value}</p>
    </div>
  );
}