export async function svgToImage(
    svgString: string,
    outWidth: number,
    outHeight: number
  ): Promise<HTMLImageElement> {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
  
    return new Promise((resolve, reject) => {
      const svgImg = new Image();
      svgImg.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = outWidth;
        canvas.height = outHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context is not available"));
          return;
        }

        const tileW = svgImg.width;
        const tileH = svgImg.height;
        for (let y = 0; y < outHeight; y += tileH) {
          for (let x = 0; x < outWidth; x += tileW) {
            ctx.drawImage(svgImg, x, y, tileW, tileH);
          }
        }
        const finalImg = new Image();
        finalImg.onload = () => {
          URL.revokeObjectURL(url);
          resolve(finalImg);
        };
        finalImg.onerror = reject;
        finalImg.src = canvas.toDataURL("image/png");
      };
      svgImg.onerror = reject;
      svgImg.src = url;
    });
  }