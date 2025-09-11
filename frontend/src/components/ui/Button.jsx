export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary:
      "bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-400",
    outline:
      "border border-brand-300 text-brand-700 bg-white hover:bg-brand-50 focus:ring-brand-300",
    ghost:
      "text-brand-700 hover:bg-brand-50 focus:ring-brand-300",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
