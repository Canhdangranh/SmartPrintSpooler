import { PDFDocument } from 'pdf-lib';
import { DocFile } from '../types';

export const processFilesToPdf = async (
  files: DocFile[],
  onProgress: (msg: string, percent: number) => void
): Promise<Uint8Array> => {
  
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const docFile = files[i];
    onProgress(`Đang xử lý ${docFile.name}...`, (i / files.length) * 100);

    try {
      // 1. Read File as ArrayBuffer
      const arrayBuffer = await docFile.file.arrayBuffer();

      // 2. Load PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // 3. Copy pages to merged document
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));

      // 4. CHECK FOR ODD PAGES & INSERT BLANK
      if (pageCount % 2 !== 0) {
        // Add a blank page to the merged document
        const blankPage = mergedPdf.addPage();
        
        // Try to match size of the last page, otherwise default to A4
        const lastPage = copiedPages[copiedPages.length - 1];
        if (lastPage) {
           const { width, height } = lastPage.getSize();
           blankPage.setSize(width, height);
        } else {
           // Fallback A4 size
           blankPage.setSize(595.28, 841.89);
        }
      }

    } catch (err) {
      console.error(`Error processing file ${docFile.name}:`, err);
      // Skip file on error but log it
    }
  }

  onProgress('Đang tạo file cuối cùng...', 100);
  const savedPdfBytes = await mergedPdf.save();
  return savedPdfBytes;
};