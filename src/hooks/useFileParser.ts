import { useState } from 'react';
import type { UploadedFile } from '../types';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function useFileParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const parseFile = async (file: File): Promise<UploadedFile | null> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`文件大小超过限制（最大50MB）。当前文件大小：${(file.size / 1024 / 1024).toFixed(1)}MB`);
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'pdf') {
        return await parsePDF(file);
      } else {
        throw new Error('不支持的文件格式。请上传 PDF 文件。');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '文件解析失败，请重试';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const parsePDF = async (file: File): Promise<UploadedFile> => {
    setProgress(10);

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    setProgress(20);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    setProgress(30);

    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';

      setProgress(30 + Math.floor((i / pageCount) * 60));
    }

    setProgress(100);

    if (!fullText.trim()) {
      throw new Error('无法从PDF中提取文本内容。可能是扫描版PDF，建议使用文字版PDF。');
    }

    return {
      name: file.name,
      type: 'pdf',
      content: fullText.trim(),
      fileData: arrayBuffer,
      pageCount,
      title: file.name.replace('.pdf', ''),
    };
  };

  return { parseFile, isLoading, error, progress };
}