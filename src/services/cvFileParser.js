import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const normalizeText = (text = '') => text.replace(/\s+/g, ' ').trim();

const getFileExtension = (fileName = '') => {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
};

const parseTxt = async (file) => {
  const raw = await file.text();
  return normalizeText(raw);
};

const parsePdf = async (file) => {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    pages.push(pageText);
  }

  return normalizeText(pages.join(' '));
};

const parseDocx = async (file) => {
  const bytes = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: bytes });
  return normalizeText(result.value);
};

export const parseCVFile = async (file) => {
  if (!file) {
    throw new Error('No file supplied');
  }

  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  let text = '';
  if (extension === 'txt' || mimeType === 'text/plain') {
    text = await parseTxt(file);
  } else if (extension === 'pdf' || mimeType === 'application/pdf') {
    text = await parsePdf(file);
  } else if (
    extension === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    text = await parseDocx(file);
  } else {
    throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
  }

  if (!text || text.length < 40) {
    throw new Error('We could not extract enough readable text from this file.');
  }

  return {
    text,
    metadata: {
      name: file.name,
      size: file.size,
      type: mimeType || extension || 'unknown'
    }
  };
};
