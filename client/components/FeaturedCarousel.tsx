import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { removeWhiteBackground } from "@/lib/image";

type FeaturedCarouselProps = {
  images: string[];
  intervalMs?: number;
  className?: string;
  /** Se true, tenta remover o fundo (branco/uniforme) via canvas */
  removeBackground?: boolean;
};

export function FeaturedCarousel({ images, intervalMs = 3500, className, removeBackground = false }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [processed, setProcessed] = useState<string[] | null>(null);

  const imgs = useMemo(() => {
    return removeBackground && processed ? processed : images;
  }, [removeBackground, processed, images]);

  useEffect(() => {
    if (!images?.length) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images, intervalMs]);

  useEffect(() => {
    let active = true;
    async function work() {
      if (!removeBackground || !images?.length) {
        setProcessed(null);
        return;
      }
      const out: string[] = [];
      for (const src of images) {
        try {
          const cleaned = await removeWhiteBackground(src);
          if (!active) return;
          out.push(cleaned);
        } catch {
          if (!active) return;
          out.push(src);
        }
      }
      if (active) setProcessed(out);
    }
    work();
    return () => { active = false; };
  }, [images, removeBackground]);

  if (!imgs || imgs.length === 0) {
    return (
      <div className={cn("h-56 rounded-xl grid place-items-center text-muted-foreground", className)}>
        Imagens de produtos
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl h-56", className)}>
      {/* Slides */}
      <div className="absolute inset-0">
        {imgs.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt="Destaque"
            className={cn(
              "absolute inset-0 m-auto h-full w-full object-contain transition-opacity duration-700 ease-in-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 w-5 rounded-full transition-colors",
              i === index ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}


