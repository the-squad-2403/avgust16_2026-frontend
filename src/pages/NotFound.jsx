import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 px-6 text-center">
      <p className="text-6xl mb-4">🦊</p>
      <h1 className="text-xl font-bold text-base-content mb-1">
        Sahifa topilmadi
      </h1>
      <p className="text-sm text-neutral mb-6">
        Siz izlayotgan sahifa mavjud emas.
      </p>
      <Link to="/dashboard" className="tt-btn-primary max-w-xs">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}