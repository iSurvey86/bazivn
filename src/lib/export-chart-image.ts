import { toPng } from "html-to-image";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function isExportExcluded(domNode: HTMLElement) {
  return (
    domNode.classList?.contains("bazi-no-export") ||
    Boolean(domNode.closest?.(".bazi-no-export"))
  );
}

/** Expand scroll containers and hide UI-only controls before capture. */
function prepareNodeForExport(node: HTMLElement) {
  const scrollers = node.querySelectorAll<HTMLElement>(".bazi-scroll-x");
  const savedScrollers: { el: HTMLElement; overflow: string; width: string }[] =
    [];

  scrollers.forEach((el) => {
    savedScrollers.push({
      el,
      overflow: el.style.overflow,
      width: el.style.width,
    });
    el.style.overflow = "visible";
    el.style.width = `${el.scrollWidth}px`;
  });

  const excluded = node.querySelectorAll<HTMLElement>(".bazi-no-export");
  const savedExcluded: { el: HTMLElement; display: string }[] = [];
  excluded.forEach((el) => {
    savedExcluded.push({ el, display: el.style.display });
    el.style.display = "none";
  });

  const savedNode = {
    overflow: node.style.overflow,
    width: node.style.width,
  };
  node.style.overflow = "visible";
  node.style.width = `${node.scrollWidth}px`;

  return () => {
    scrollers.forEach((el, i) => {
      el.style.overflow = savedScrollers[i]?.overflow ?? "";
      el.style.width = savedScrollers[i]?.width ?? "";
    });
    savedExcluded.forEach(({ el, display }) => {
      el.style.display = display;
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
    // Double rAF: layout ổn định sau khi ẩn nút / chỉnh width.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const width = Math.ceil(node.scrollWidth);
    const height = Math.ceil(node.scrollHeight);

    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
      width,
      height,
      style: {
        // Ép computed size — giảm lỗi chồng chữ do clone DOM của html-to-image
        width: `${width}px`,
        height: `${height}px`,
      },
      filter: (domNode) => {
        if (!(domNode instanceof HTMLElement)) return true;
        return !isExportExcluded(domNode);
      },
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
