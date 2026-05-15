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
      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`文件大小超过限制（最大50MB）。当前文件大小：${(file.size / 1024 / 1024).toFixed(1)}MB`);
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'pdf') {
        return await parsePDF(file);
      } else if (fileExtension === 'pptx') {
        return await parsePPTX(file);
      } else {
        throw new Error('不支持的文件格式。请上传 PDF 或 PPTX 文件。');
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

      // 更新进度
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
      pageCount,
      title: file.name.replace('.pdf', ''),
    };
  };

  const parsePPTX = async (file: File): Promise<UploadedFile> => {
    setProgress(10);

    try {
      const JSZip = (await import('jszip')).default;
      const arrayBuffer = await file.arrayBuffer();

      setProgress(30);

      const zip = await JSZip.loadAsync(arrayBuffer);

      setProgress(50);

      let fullText = '';
      let slideCount = 0;

      const slideFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
          const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
          return numA - numB;
        });

      slideCount = slideFiles.length;

      if (slideCount === 0) {
        throw new Error('无法识别PPTX文件中的幻灯片内容');
      }

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const content = await zip.files[slideFile].async('string');

        // 提取文本内容
        const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
        if (textMatches) {
          fullText += `--- 幻灯片 ${i + 1} ---\n`;
          const uniqueTexts = new Set<string>();
          textMatches.forEach(match => {
            const text = match.replace(/<\/?a:t>/g, '').trim();
            if (text && text.length > 0) {
              uniqueTexts.add(text);
            }
          });
          uniqueTexts.forEach(text => {
            fullText += text + '\n';
          });
          fullText += '\n';
        }

        // 更新进度
        setProgress(50 + Math.floor((i / slideFiles.length) * 40));
      }

      setProgress(100);

      if (!fullText.trim()) {
        throw new Error('无法从PPTX文件中提取文本内容。建议转换为PDF格式后上传，效果更佳。');
      }

      return {
        name: file.name,
        type: 'pptx',
        content: fullText.trim(),
        pageCount: slideCount,
        title: file.name.replace('.pptx', ''),
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes('无法')) {
        throw err;
      }
      throw new Error('PPTX解析失败。建议转换为PDF格式后上传，效果更佳。');
    }
  };

  return { parseFile, isLoading, error, progress };
}