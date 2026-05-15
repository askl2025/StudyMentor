import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Presentation, AlertCircle } from 'lucide-react';
import { useApp } from '../../stores/AppContext';
import { useFileParser } from '../../hooks/useFileParser';
import Card from '../../components/ui/Card';

export default function FileUpload() {
  const { dispatch } = useApp();
  const { parseFile, isLoading, error, progress } = useFileParser();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = await parseFile(file);
    if (parsed) {
      dispatch({ type: 'SET_FILE', payload: parsed });
    }
    // 重置input
    e.target.value = '';
  }, [parseFile, dispatch]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const parsed = await parseFile(file);
    if (parsed) {
      dispatch({ type: 'SET_FILE', payload: parsed });
    }
  }, [parseFile, dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <Card variant="glass" className="flex-1 flex flex-col">
      <h2 className="text-xl font-semibold text-text mb-4">学习材料</h2>

      <div
        className="flex-1 border-2 border-dashed border-accent/30 rounded-xl flex flex-col items-center justify-center p-8 hover:border-accent/60 transition-colors cursor-pointer relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className="w-10 h-10 text-accent" />
        </motion.div>

        {isLoading ? (
          <div className="text-center w-full max-w-xs">
            <p className="text-text font-medium text-lg mb-3">正在解析文件...</p>
            <div className="w-full bg-accent/10 rounded-full h-2 mb-2">
              <motion.div
                className="bg-accent h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-text/60 text-sm">{progress}%</p>
          </div>
        ) : (
          <>
            <p className="text-text font-medium text-lg mb-2">拖拽或点击上传文件</p>
            <p className="text-text/60 text-sm mb-6">支持 PDF 和 PPTX 格式，最大50MB</p>

            <label className="btn-primary px-6 py-3 rounded-lg cursor-pointer inline-flex items-center gap-2">
              <FileText className="w-5 h-5" />
              选择文件
              <input
                type="file"
                accept=".pdf,.pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </>
        )}

        {error && (
          <motion.div
            className="mt-4 flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-error text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
          <FileText className="w-8 h-8 text-accent" />
          <div>
            <p className="text-sm font-medium text-text">PDF 文件</p>
            <p className="text-xs text-text/60">课程讲义、教材</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
          <Presentation className="w-8 h-8 text-accent" />
          <div>
            <p className="text-sm font-medium text-text">PPTX 文件</p>
            <p className="text-xs text-text/60">课件、演示文稿</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
        <p className="text-xs text-text/60">
          <strong>提示：</strong>PPTX文件可能因格式复杂导致解析效果不佳。如遇问题，建议先将PPT转换为PDF格式后上传，效果更佳。
        </p>
      </div>
    </Card>
  );
}