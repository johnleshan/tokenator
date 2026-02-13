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
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils"; // Added for className utility

export default function Home() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [results, setResults] = React.useState<Array<{ fileName: string, charCount: number, tokenCount: number, isExact: boolean, isLoading: boolean, error?: string }>>([]);
  const [apiKey, setApiKey] = React.useState<string>("");
  const [overallStats, setOverallStats] = React.useState({ totalTokens: 0, totalChars: 0 });
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkMobile();

    // Event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFilesSelect = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsProcessing(true);

    // Initialize results with looking state
    const initialResults = selectedFiles.map(f => ({
      fileName: f.name,
      charCount: 0,
      tokenCount: 0,
      isExact: false,
      isLoading: true
    }));
    setResults(initialResults);

    // Parallel Processing
    try {
      const processedResults = await Promise.all(selectedFiles.map(async (file) => {
        try {
          const text = await extractText(file);
          const { count, isExact } = await countTokens(text, apiKey);
          return {
            fileName: file.name,
            charCount: text.length,
            tokenCount: count,
            isExact,
            isLoading: false
          };
        } catch (err) {
          console.error("Error processing file:", file.name, err);
          return {
            fileName: file.name,
            charCount: 0,
            tokenCount: 0,
            isExact: false,
            isLoading: false,
            error: "Failed to process"
          };
        }
      }));

      setResults(processedResults);

      const totalTok = processedResults.reduce((acc, curr) => acc + curr.tokenCount, 0);
      const totalChar = processedResults.reduce((acc, curr) => acc + curr.charCount, 0);
      setOverallStats({ totalTokens: totalTok, totalChars: totalChar });

    } catch (error) {
      console.error("Batch processing error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyChange = (key: string) => {
    setApiKey(key);
  };

  React.useEffect(() => {
    if (files.length > 0 && apiKey) {
      handleFilesSelect(files);
    }
  }, [apiKey]);

  const MAX_TOKENS = 1000000;
  const percentage = Math.min((overallStats.totalTokens / MAX_TOKENS) * 100, 100);
  const isOverLimit = overallStats.totalTokens > MAX_TOKENS;

  // Prepare Pie Data (Group small values)
  const pieData = React.useMemo(() => {
    const sorted = [...results].sort((a, b) => b.tokenCount - a.tokenCount);
    if (sorted.length === 0) return [];

    let chartData = [];
    if (sorted.length <= 5) {
      chartData = sorted;
    } else {
      const top5 = sorted.slice(0, 5);
      const others = sorted.slice(5);
      const othersTokenCount = others.reduce((acc, curr) => acc + curr.tokenCount, 0);
      chartData = [...top5];
      if (othersTokenCount > 0) {
        chartData.push({ fileName: "Others", tokenCount: othersTokenCount, charCount: 0, isExact: false, isLoading: false });
      }
    }

    // Add percentage to name for Legend
    const total = chartData.reduce((acc, curr) => acc + curr.tokenCount, 0) || 1;
    return chartData.map(item => ({
      ...item,
      legendLabel: `${item.fileName.length > 20 ? item.fileName.substring(0, 20) + '...' : item.fileName} (${((item.tokenCount / total) * 100).toFixed(0)}%)`
    }));
  }, [results]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-zinc-950 dark:to-zinc-950"></div>

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Tokenator
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Check if your documents fit within the <span className="font-semibold text-blue-600 dark:text-blue-400">1 Million Token</span> context window of Gemini 2.5 Flash.
          </p>
        </motion.div>

        <div className="mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto"
          >
            <APIKeyInput onKeyChange={handleKeyChange} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <FileDropzone onFilesSelect={handleFilesSelect} isLoading={isProcessing} />
          </motion.div>

          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-12"
              >
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="mt-4 animate-pulse text-lg font-medium text-zinc-600 dark:text-zinc-400">
                  Tokenating...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isProcessing && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-8"
            >
              {/* Overall Stats */}
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 sm:p-8 dark:border-blue-900/30 dark:bg-blue-900/10">
                <h3 className="mb-4 text-2xl font-bold text-blue-900 dark:text-blue-100">Total Consumption</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-zinc-500">Context Usage ({results.length} files)</span>
                    <span className={isOverLimit ? "text-red-500" : "text-zinc-900 dark:text-zinc-100"}>
                      {percentage.toFixed(1)}% of 1M limit
                    </span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded-full bg-white dark:bg-zinc-800">
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
                  <div className="mt-2 flex justify-between text-base text-zinc-500">
                    <span>{new Intl.NumberFormat("en-US").format(overallStats.totalTokens)} Tokens</span>
                    <span>{new Intl.NumberFormat("en-US").format(overallStats.totalChars)} Chars</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid gap-8 grid-cols-1">
                {/* Pie Chart - Distribution */}
                <div className="rounded-3xl border border-blue-200 bg-white p-4 sm:p-8 shadow-sm dark:border-blue-900/30 dark:bg-zinc-900">
                  <h3 className="mb-6 text-center text-xl font-bold text-zinc-700 dark:text-zinc-200">Token Distribution</h3>
                  <div className="h-80 sm:h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="tokenCount"
                          nameKey="legendLabel"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          fill="#8884d8"
                          label={false}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[
                              "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"
                            ][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                          itemStyle={{ color: "#f3f4f6" }}
                        />
                        <Legend
                          layout={isMobile ? "horizontal" : "vertical"}
                          verticalAlign={isMobile ? "bottom" : "middle"}
                          align={isMobile ? "center" : "right"}
                          wrapperStyle={isMobile ? { paddingTop: "20px" } : { paddingLeft: "20px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart - Tokens vs Chars */}
                <div className="rounded-3xl border border-blue-200 bg-white p-4 sm:p-8 shadow-sm dark:border-blue-900/30 dark:bg-zinc-900">
                  <h3 className="mb-6 text-center text-xl font-bold text-zinc-700 dark:text-zinc-200">File Comparison</h3>
                  <div className="h-64 sm:h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.slice(0, 10)}>
                        <XAxis dataKey="fileName" tickFormatter={(val) => val.length > 5 ? `${val.substring(0, 5)}...` : val} stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="tokenCount" name="Tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="charCount" name="Chars" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Collapsible Detailed Stats */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">Detailed File Stats</h3>
                  <div className="rounded-full bg-zinc-100 p-2 text-zinc-500 dark:bg-zinc-800">
                    {isDetailsOpen ? <div className="h-5 w-5">▲</div> : <div className="h-5 w-5">▼</div>}
                  </div>
                </button>

                <AnimatePresence>
                  {isDetailsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-6">
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
