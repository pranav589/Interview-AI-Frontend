'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MESSAGES } from '@/lib/constants';

interface ResumeUploadModalProps {
  onClose: () => void;
  onUpload?: (data: { filename: string; resumeText: string }) => void;
}

export default function ResumeUploadModal({ onClose, onUpload }: ResumeUploadModalProps) {
  const { refreshUser } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError(MESSAGES.RESUME.PDF_ONLY);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError(MESSAGES.RESUME.PDF_ONLY);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await api.post<{ message: string; resumeText: string }>('user/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh user context to update user.resume state globally
      await refreshUser();

      if (onUpload) {
        onUpload({
          filename: selectedFile.name,
          resumeText: response.resumeText
        });
      }

      setUploadComplete(true);

      // Close after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.response?.data?.error || MESSAGES.RESUME.UPLOAD_FAILED);
    } finally {
      setIsProcessing(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Upload your PDF resume to extract skills and experience</CardDescription>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardContent className="space-y-6">
            {!uploadComplete ? (
              <>
                {/* File Upload Area */}
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : selectedFile
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  whileHover={{ borderColor: 'var(--primary)' }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="resume-input"
                  />

                  <label htmlFor="resume-input" className="cursor-pointer block">
                    <div className="flex justify-center mb-3">
                      <div className={`p-3 rounded-full ${selectedFile ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Upload className={`w-6 h-6 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                    <p className="font-semibold text-sm">
                      {selectedFile ? selectedFile.name : 'Drop your resume here'}
                    </p>
                    {!selectedFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to browse
                      </p>
                    )}
                  </label>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* File Info */}
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <p className="text-sm">
                      <span className="font-medium">Size:</span> {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Upload & Extract'}
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center mb-4"
                >
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">Resume Uploaded!</h3>
                <p className="text-sm text-muted-foreground">
                  Your resume has been successfully processed and your data extracted.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
