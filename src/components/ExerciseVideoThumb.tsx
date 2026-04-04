import { useEffect, useMemo, useState } from "react";
import { getExerciseImageUrl } from "../data/exerciseMedia";

type Props = {
  exerciseName: string;
  className?: string;
};

const FALLBACK =
  "https://images.unsplash.com/photo-1534438327276-14e3350c14ce?auto=format&fit=crop&w=480&h=360&q=80";

export function ExerciseVideoThumb({ exerciseName, className = "" }: Props) {
  const src = useMemo(() => getExerciseImageUrl(exerciseName), [exerciseName]);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900 ring-1 ring-white/10 ${className}`}
    >
      <img
        src={imgSrc}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setImgSrc(FALLBACK)}
        className="h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
        aria-hidden
      />
      <p className="pointer-events-none absolute bottom-1.5 left-2 right-2 truncate text-[10px] sm:text-xs font-semibold text-white/90 drop-shadow">
        {exerciseName}
      </p>
    </div>
  );
}
