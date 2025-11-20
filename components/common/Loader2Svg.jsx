export default function LoaderSvg({ height = "100vh" }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: height }}
    >
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        width="60"
        height="60"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#D3202D"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="60 150"
          strokeDashoffset="0"
        />
      </svg>
    </div>
  );
}