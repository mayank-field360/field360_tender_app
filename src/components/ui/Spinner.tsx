interface SpinnerProps {
  size?: number;
  dark?: boolean;
  className?: string;
}

export default function Spinner({ size = 20, dark = false, className = "" }: SpinnerProps) {
  return (
    <div
      className={`spinner ${dark ? "spinner-dark" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
