// To use your own logo: replace public/logo.svg (or point src to your PNG) and the icons in public/icons.
export default function Logo({ size = 36, text = true }: { size?: number; text?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="Isrealight Data Hub" width={size} height={size} className="rounded-xl" />
      {text && (
        <span className="font-bold leading-tight tracking-tight">
          Isrealight <span className="text-gold-dark dark:text-gold-light">Data Hub</span>
        </span>
      )}
    </span>
  );
}
