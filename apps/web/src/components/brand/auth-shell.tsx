import { MotocopilotoLogo } from "./logo";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden overscroll-x-none overscroll-y-contain [-webkit-overflow-scrolling:touch]">
      <div className="motoboy-auth-gradient px-6 pt-10 pb-8 rounded-b-3xl flex flex-col items-center text-center">
        <MotocopilotoLogo size="md" centered />
        <h1 className="text-xl font-semibold mt-6 text-white">{title}</h1>
        <p className="text-sm text-emerald-100/80 mt-1 max-w-xs">{subtitle}</p>
      </div>
      <div className="flex-1 p-6 -mt-4 w-full max-w-full min-w-0 overflow-x-hidden box-border">
        {children}
      </div>
    </div>
  );
}
