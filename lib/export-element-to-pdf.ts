import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

interface ExportElementToPdfOptions {
  filename: string;
  backgroundColor?: string;
  margin?: number;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportElementToPdfOptions,
): Promise<void> {
  const margin = options.margin ?? 12;
  const backgroundColor = options.backgroundColor ?? "#ffffff";

  await wait(150);
  await document.fonts.ready;
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor,
    pixelRatio: 2,
    style: {
      background: backgroundColor,
    },
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const imgProps = pdf.getImageProperties(dataUrl);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const renderedHeight = (imgProps.height * usableWidth) / imgProps.width;

  let heightLeft = renderedHeight;
  let position = margin;

  pdf.addImage(dataUrl, "PNG", margin, position, usableWidth, renderedHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    position = margin - (renderedHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", margin, position, usableWidth, renderedHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(options.filename);
}
