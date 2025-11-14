export type RemoveBgOptions = {
  /** Tolerância de cor para considerar como fundo (0-255). Default: 30 */
  threshold?: number;
};

/**
 * Remove fundo próximo da cor de fundo (amostrada do pixel (0,0)) e/ou branco, gerando PNG com transparência.
 * Funciona melhor com imagens base64 (data URL) ou URLs com CORS habilitado.
 */
export async function removeWhiteBackground(src: string, options: RemoveBgOptions = {}): Promise<string> {
  const threshold = options.threshold ?? 30;
  try {
    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return src;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.drawImage(img, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Amostra a cor do canto superior esquerdo como cor de fundo
    const r0 = data[0];
    const g0 = data[1];
    const b0 = data[2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const nearSample = Math.abs(r - r0) <= threshold && Math.abs(g - g0) <= threshold && Math.abs(b - b0) <= threshold;
      const nearWhite = r >= 255 - threshold && g >= 255 - threshold && b >= 255 - threshold;

      if (nearSample || nearWhite) {
        data[i + 3] = 0; // alpha = 0 (transparente)
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return src; // falha (ex.: CORS): retorna original
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // tenta evitar taint em URLs com CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}


