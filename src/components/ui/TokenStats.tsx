"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Zap } from "lucide-react";

interface TokenStatsProps {
    charCount: number;
    tokenCount: number;
    isExact?: boolean;
    fileName?: string;
    isLoading?: boolean;
    error?: string;
}

export function TokenStats({
    charCount,
    tokenCount,
    isExact = false,
    fileName,
    isLoading,
    error,
}: TokenStatsProps) {
    const MAX_TOKENS = 1000000;
    const percentage = Math.min((tokenCount / MAX_TOKENS) * 100, 100);
    const isOverLimit = tokenCount > MAX_TOKENS;

    const formattedTokens = new Intl.NumberFormat("en-US").format(tokenCount);
    const formattedChars = new Intl.NumberFormat("en-US").format(charCount);

    if (isLoading) {
        return (
            <div className="w-full animate-pulse space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="h-8 w-1/3 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="h-4 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800"></div>
                    <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800"></div>
                </div>
            </div>
        );
    }

    if (!fileName) return null;

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/30 dark:bg-red-900/20"
            >
                <div className="flex items-start gap-4">
                    <AlertTriangle className="shrink-0 text-red-600 dark:text-red-400" size={24} />
                    <div>
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Analysis Failed</h3>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{fileName}</p>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-400 opacity-90">{error}</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6 rounded-3xl border border-zinc-200 bg-white p-4 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
            <div className="flex flex-col items-start gap-4 justify-between sm:flex-row sm:items-center sm:gap-0">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        Analysis Results
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">{fileName}</p>
                </div>
                <div className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider",
                    isExact ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                    {isExact ? "Verified Count" : "Estimated Count"}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">Context Usage</span>
                    <span className={isOverLimit ? "text-red-500" : "text-zinc-900 dark:text-zinc-100"}>
                        {percentage.toFixed(1)}% of 1M limit
                    </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full transition-colors",
                            isOverLimit ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
                    <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <CheckCircle size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Characters</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        {formattedChars}
                    </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Zap size={64} />
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Zap size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Tokens</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        {formattedTokens}
                    </div>
                </div>
            </div>

            {isOverLimit && (
                <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
                    <AlertTriangle className="shrink-0" size={20} />
                    <div>
                        <p className="font-semibold">Context Window Exceeded</p>
                        <p className="mt-1 opacity-90">
                            This document exceeds the 1 million token limit of Gemini 2.5 Flash. You may need to split the document or summarize it.
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
