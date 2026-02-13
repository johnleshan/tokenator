"use client";

import * as React from "react";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { TokenStats } from "@/components/ui/TokenStats";
import { APIKeyInput } from "@/components/ui/APIKeyInput";
import { extractText } from "@/lib/fileProcessor";
import { countTokens } from "@/lib/tokenCounter";
import { generatePDFReport } from "@/lib/reportGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Github, RefreshCw, FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils"; // Added for className utility

export default function Home() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [results, setResults] = React.useState<Array<{ fileName: string, charCount: number, tokenCount: number, isExact: boolean, isLoading: boolean, error?: string }>>([]);
  const [apiKey, setApiKey] = React.useState<string>("");
  const [overallStats, setOverallStats] = React.useState({ totalTokens: 0, totalChars: 0 });

  const handleFilesSelect = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Initialize results with loading state
    const initialResults = selectedFiles.map(f => ({
      fileName: f.name,
      charCount: 0,
      tokenCount: 0,
      isExact: false,
      isLoading: true
    }));
    setResults(initialResults);

    // Process files
    const newResults: typeof results = [...initialResults];
    let totalTok = 0;
    let totalChar = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const text = await extractText(file);
        const { count, isExact } = await countTokens(text, apiKey);

        newResults[i] = {
          fileName: file.name,
          charCount: text.length,
          tokenCount: count,
          isExact,
          isLoading: false
        };
        totalTok += count;
        totalChar += text.length;
      } catch (err: any) {
        console.error(err);
        newResults[i] = {
          fileName: file.name,
          charCount: 0,
          tokenCount: 0,
          isExact: false,
          isLoading: false,
          error: "Failed to process"
        };
      }
      // Update state progressively
      setResults([...newResults]);
      setOverallStats({ totalTokens: totalTok, totalChars: totalChar });
    }
  };

  const handleKeyChange = (key: string) => {
    setApiKey(key);
  };

  // Re-calc if key changes - simpler to just ask user to re-process for now or we need to store text in memory
  // For batch, storing all text might be heavy. Let's rely on user re-uploading or add a "Re-analyze" button if files are present.
  // Actually, we can keep the files in memory and re-trigger.
  React.useEffect(() => {
    if (files.length > 0 && apiKey) {
      handleFilesSelect(files);
    }
  }, [apiKey]); // Be careful with loops, handleFilesSelect depends on files/apiKey. 
  // Better: separate the processing logic. But for now this is fine if we debounce or user interaction drives it.
  // Actually, let's just let the user re-drop or rely on the initial API key presence.

  const MAX_TOKENS = 1000000;
  const percentage = Math.min((overallStats.totalTokens / MAX_TOKENS) * 100, 100);
  const isOverLimit = overallStats.totalTokens > MAX_TOKENS;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-zinc-950 dark:to-zinc-950"></div>

      <main className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Tokenator
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Check if your documents fit within the <span className="font-semibold text-blue-600 dark:text-blue-400">1 Million Token</span> context window of Gemini 2.5 Flash.
          </p>
        </motion.div>

        <div className="mx-auto max-w-xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <APIKeyInput onKeyChange={handleKeyChange} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FileDropzone onFilesSelect={handleFilesSelect} isLoading={results.some(r => r.isLoading)} />
          </motion.div>

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-6"
            >
              {/* Overall Stats */}
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
                <h3 className="mb-4 text-lg font-bold text-blue-900 dark:text-blue-100">Total Consumption</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">Context Usage ({results.length} files)</span>
                    <span className={isOverLimit ? "text-red-500" : "text-zinc-900 dark:text-zinc-100"}>
                      {percentage.toFixed(1)}% of 1M limit
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-white dark:bg-zinc-800">
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
                  <div className="mt-2 flex justify-between text-sm text-zinc-500">
                    <span>{new Intl.NumberFormat("en-US").format(overallStats.totalTokens)} Tokens</span>
                    <span>{new Intl.NumberFormat("en-US").format(overallStats.totalChars)} Chars</span>
                  </div>
                </div>
              </div>

              {/* Individual Files */}
              <div className="space-y-4">
                {results.map((result, index) => (
                  <TokenStats
                    key={index}
                    charCount={result.charCount}
                    tokenCount={result.tokenCount}
                    isExact={result.isExact}
                    fileName={result.fileName}
                    isLoading={result.isLoading}
                    error={result.error}
                  />
                ))}
              </div>



              <div className="mt-6 flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => generatePDFReport(results, overallStats)}
                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  <FileDown size={16} className="mr-2" />
                  Download Report
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => { setFiles([]); setResults([]); setOverallStats({ totalTokens: 0, totalChars: 0 }); }}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Start Over
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <footer className="mt-20 text-center text-sm text-zinc-400 dark:text-zinc-600">
          <p>© {new Date().getFullYear()} Tokenator. Built for Gemini.</p>
        </footer>
      </main>
    </div>
  );

}
