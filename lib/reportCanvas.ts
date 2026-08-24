interface DrawOptions {
  scale?: number;
  theme?: "light" | "dark";
}

const FONT_SIZE = 13;
const LINE_HEIGHT = 19;
const PADDING = 20;
const FONT = `${FONT_SIZE}px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`;

function themeColors(theme: "light" | "dark") {
  return theme === "dark" ? { bg: "#181c21", fg: "#f2f4f6" } : { bg: "#ffffff", fg: "#171b1f" };
}

export function drawAsciiReport(
  canvas: HTMLCanvasElement,
  reportText: string,
  { scale = 1, theme = "light" }: DrawOptions = {}
) {
  const lines = reportText.split("\n");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const colors = themeColors(theme);

  // Measure widest line first at base scale to size the canvas.
  ctx.font = FONT;
  let maxWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxWidth) maxWidth = w;
  }

  const width = Math.ceil(maxWidth) + PADDING * 2;
  const height = lines.length * LINE_HEIGHT + PADDING * 2;

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.font = FONT;
  ctx.fillStyle = colors.fg;
  ctx.textBaseline = "top";
  lines.forEach((line, i) => {
    ctx.fillText(line, PADDING, PADDING + i * LINE_HEIGHT);
  });

  return { width, height };
}
