import { toPng } from "html-to-image";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/** Expand scroll containers so full chart is captured in the image. */
function prepareNodeForExport(node: HTMLElement) {
  const scrollers = node.querySelectorAll<HTMLElement>(".bazi-scroll-x");
  const saved: { el: HTMLElement; overflow: string; width: string }[] = [];

  scrollers.forEach((el) => {
    saved.push({
      el,
      overflow: el.style.overflow,
      width: el.style.width,
    });
    el.style.overflow = "visible";
    el.style.width = `${el.scrollWidth}px`;
  });

  const savedNode = {
    overflow: node.style.overflow,
    width: node.style.width,
  };
  node.style.overflow = "visible";
  node.style.width = `${node.scrollWidth}px`;

  return () => {
    scrollers.forEach((el, i) => {
      el.style.overflow = saved[i]?.overflow ?? "";
      el.style.width = saved[i]?.width ?? "";
    });
    node.style.overflow = savedNode.overflow;
    node.style.width = savedNode.width;
  };
}

export async function exportChartAsPng(
  node: HTMLElement,
  options: { fullName?: string | null; referenceYear: number },
) {
  const restore = prepareNodeForExport(node);

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
      width: node.scrollWidth,
      height: node.scrollHeight,
    });

    const namePart = slugify(options.fullName?.trim() || "la-so");
    const filename = `bazivn-${namePart}-${options.referenceYear}.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    restore();
  }
}
