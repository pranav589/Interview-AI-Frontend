'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
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
  const [duplicateData, setDuplicateData] = useState<{
    resumeId: string;
    resumeText: string;
    extractionStatus: string;
    jobId?: string;
    canUseCached: boolean;
    canForceReextract: boolean;
  } | null>(null);

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

  const handleUpload = async (force: boolean = false) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (force === true) {
        formData.append('forceReextract', 'true');
      }

      const response = await api.post<any>('user/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = response?.data || response;

      if (responseData?.isDuplicate && !responseData?.startedExtraction && force !== true) {
        const extractionStatus = responseData.extractionStatus || 'completed';
        setDuplicateData({
          resumeId: responseData.resumeId || '',
          resumeText: responseData.resumeText || '',
          extractionStatus,
          jobId: responseData.jobId,
          canUseCached: extractionStatus === 'completed',
          canForceReextract: extractionStatus !== 'pending' && extractionStatus !== 'processing',
        });
        setIsProcessing(false);
        return;
      }

      // Refresh user context to update user.resume state globally
      await refreshUser();

      if (onUpload) {
        onUpload({
          filename: selectedFile.name,
          resumeText: responseData?.resumeText || ''
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

  const handleUseCached = async () => {
    if (!duplicateData) return;
    setIsProcessing(true);
    setError(null);
    try {
      await refreshUser();
      if (onUpload) {
        onUpload({
          filename: selectedFile?.name || 'resume.pdf',
          resumeText: duplicateData.resumeText,
        });
      }
      setUploadComplete(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Cached load Error:', err);
      setError('Failed to load cached resume.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceReextract = () => {
    setDuplicateData(null);
    handleUpload(true);
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
              duplicateData ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="relative overflow-hidden p-6 rounded-2xl border border-primary/20 bg-background/40 backdrop-blur-xl shadow-xl space-y-4">
                    {/* Ambient Glow */}
                    <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base text-foreground">
                          {duplicateData.extractionStatus === 'pending' || duplicateData.extractionStatus === 'processing'
                            ? 'Extraction In Progress'
                            : duplicateData.extractionStatus === 'failed'
                            ? 'Previous Extraction Failed'
                            : 'Duplicate Detected'}
                        </h4>
                        <p className="text-xs text-muted-foreground">This resume matches an existing one in your profile.</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      {duplicateData.extractionStatus === 'pending' || duplicateData.extractionStatus === 'processing'
                        ? "Details are already being extracted in the background. We'll notify you when it's ready."
                        : duplicateData.extractionStatus === 'failed'
                        ? 'The previous background extraction failed. You can retry extraction for this resume.'
                        : "We've already extracted the skills, experience, and projects for a matching resume. How would you like to proceed?"}
                    </p>

                    <div className="grid gap-3 pt-2">
                      {/* Option 1: Use cached */}
                      {duplicateData.canUseCached && (
                        <button
                          onClick={handleUseCached}
                          disabled={isProcessing}
                          className="group relative flex items-start gap-4 p-4 rounded-xl border border-border bg-background/50 hover:bg-muted/50 hover:border-primary/50 text-left transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-foreground">Use Existing Extraction</span>
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Instant
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Load details immediately from cache. No LLM tokens or wait time required.
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Option 2: Force reextract */}
                      {duplicateData.canForceReextract && (
                        <button
                          onClick={handleForceReextract}
                          disabled={isProcessing}
                          className="group relative flex items-start gap-4 p-4 rounded-xl border border-border bg-background/50 hover:bg-muted/50 hover:border-primary/50 text-left transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-foreground">
                                {duplicateData.extractionStatus === 'failed' ? 'Retry Extraction' : 'Force Re-extraction'}
                              </span>
                              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Background Job
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Run a brand new deep AI extraction. This will run in the background and notify you.
                            </p>
                          </div>
                        </button>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm mt-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDuplicateData(null);
                          setSelectedFile(null);
                        }}
                        disabled={isProcessing}
                        className="text-xs"
                      >
                        Upload different file
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
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
                      onClick={() => handleUpload(false)}
                      disabled={!selectedFile || isProcessing}
                      className="flex-1 text-white"
                    >
                      {isProcessing ? 'Processing...' : 'Upload & Extract'}
                    </Button>
                  </div>
                </>
              )
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
                  Details are being extracted in the background. We'll notify you when it's ready.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
