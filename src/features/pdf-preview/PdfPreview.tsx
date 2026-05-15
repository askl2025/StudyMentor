import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface PdfPreviewProps {
  fileData: ArrayBuffer;
  fileName: string;
}

export default function PdfPreview({ fileData, fileName }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      const doc = await pdfjsLib.getDocument({ data: fileData.slice(0) }).promise;
      if (cancelled) return;

      setPdfDoc(doc);
      setTotalPages(doc.numPages);
    };

    loadPdf();

    return () => { cancelled = true; };
  }, [fileData]);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    setRendering(true);

    const page = await pdfDoc.getPage(pageNum);
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32;

    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    setRendering(false);
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 px-1">
        <FileText className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-text truncate">{fileName}</span>
        {totalPages > 0 && (
          <span className="text-xs text-text/50 ml-auto flex-shrink-0">{totalPages}页</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin flex justify-center bg-white/30 rounded-lg p-4 min-h-0"
      >
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <motion.button
            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={goPrev}
            disabled={currentPage <= 1}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-4 h-4 text-accent" />
          </motion.button>
          <span className="text-sm text-text/70">
            {currentPage} / {totalPages}
          </span>
          <motion.button
            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={goNext}
            disabled={currentPage >= totalPages}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-4 h-4 text-accent" />
          </motion.button>
        </div>
      )}
    </Card>
  );
}