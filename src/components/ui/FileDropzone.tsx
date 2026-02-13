"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
    onFilesSelect: (files: File[]) => void;
    isLoading?: boolean;
}

export function FileDropzone({ onFilesSelect, isLoading }: FileDropzoneProps) {
    const [isDragActive, setIsDragActive] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelect(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelect(Array.from(e.target.files));
        }
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300",
                isDragActive
                    ? "border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            )}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleChange}
                accept=".txt,.md,.pdf,.docx"
                disabled={isLoading}
            />

            <AnimatePresence>
                {isDragActive ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl shadow-blue-500/30">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-500">Drop it like it's hot!</h3>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                            <FileIcon size={32} className="text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Upload your document
                        </h3>
                        <p className="mb-6 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
                            Drag and drop or click to browse. We support PDF, DOCX, TXT, and MD.
                        </p>
                        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                Secure Processing
                            </span>
                            <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700"></span>
                            <span>Local Only</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
