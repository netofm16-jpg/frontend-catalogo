import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ImageMagnifierProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Fator de zoom da lupa */
  zoom?: number;
  /** Diâmetro da lupa em px */
  lensSize?: number;
};

export function ImageMagnifier({ src, alt, className, zoom = 2, lensSize = 140 }: ImageMagnifierProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [showLens, setShowLens] = useState(false);
  const [bgSize, setBgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [bgPos, setBgPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const handleLoad = () => {
      const naturalW = img.naturalWidth || 0;
      const naturalH = img.naturalHeight || 0;
      setBgSize({ w: naturalW * zoom, h: naturalH * zoom });
    };
    if (img.complete) handleLoad();
    else img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [src, zoom]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    const img = imgRef.current;
    if (!rect || !img) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));

    // posição de background proporcional à posição do cursor
    const percentX = clampedX / rect.width;
    const percentY = clampedY / rect.height;
    const posX = percentX * (bgSize.w - rect.width);
    const posY = percentY * (bgSize.h - rect.height);
    setBgPos({ x: -posX, y: -posY });
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative select-none rounded border bg-card",
        // tamanho menor e exibindo a imagem inteira
        "w-full h-64 overflow-hidden",
        className,
      )}
      onMouseEnter={() => setShowLens(true)}
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={onMove}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
      />

      {showLens && bgSize.w > 0 && (
        <div
          style={{
            width: lensSize,
            height: lensSize,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bgSize.w}px ${bgSize.h}px`,
            backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
          }}
          className="pointer-events-none absolute rounded-full border-2 border-white/70 shadow-xl mix-blend-normal"
        />
      )}
    </div>
  );
}


