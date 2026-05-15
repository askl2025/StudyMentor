import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
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
    <Card variant="glass" className="max-w-lg w-full">
      <div className="text-center mb-6">
        <motion.div
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <FileText className="w-8 h-8 text-accent" />
        </motion.div>
        <h2 className="text-xl font-bold text-text mb-1">上传学习材料</h2>
        <p className="text-text/60 text-sm">上传PDF文件，开始AI辅导学习</p>
      </div>

      <div
        className="border-2 border-dashed border-accent/30 rounded-xl flex flex-col items-center justify-center p-8 hover:border-accent/60 transition-colors cursor-pointer relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className="w-8 h-8 text-accent" />
        </motion.div>

        {isLoading ? (
          <div className="text-center w-full max-w-xs">
            <p className="text-text font-medium mb-3">正在解析PDF...</p>
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
            <p className="text-text font-medium mb-2">拖拽或点击上传PDF</p>
            <p className="text-text/60 text-sm mb-4">最大50MB</p>
            <label className="btn-primary px-6 py-3 rounded-lg cursor-pointer inline-flex items-center gap-2">
              <FileText className="w-5 h-5" />
              选择PDF文件
              <input
                type="file"
                accept=".pdf"
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
    </Card>
  );
}