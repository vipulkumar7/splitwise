export default function Button({
  loading,
  children,
  variant = "primary",
  className = "",
  ...props
}: any) {
  const base =
    "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2";

  const variants: any = {
    primary: loading
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-green-500 text-white hover:bg-green-600 active:scale-95",

    secondary: `
      bg-white text-black border
      hover:bg-gray-100
    `,
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}

      <span>{children}</span>
    </button>
  );
}
