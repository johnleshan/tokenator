"use client";

import * as React from "react";
import { Eye, EyeOff, Key, Check } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface APIKeyInputProps {
    onKeyChange: (key: string) => void;
}

export function APIKeyInput({ onKeyChange }: APIKeyInputProps) {
    const [key, setKey] = React.useState("");
    const [isVisible, setIsVisible] = React.useState(false);
    const [isSaved, setIsSaved] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        const storedKey = localStorage.getItem("gemini_api_key");
        if (storedKey) {
            setKey(storedKey);
            onKeyChange(storedKey);
            setIsSaved(true);
        }
    }, [onKeyChange]);

    const handleSave = () => {
        localStorage.setItem("gemini_api_key", key);
        onKeyChange(key);
        setIsSaved(true);
        // Hide visibility after save for privacy
        // Actually, let's keep it consistent with request: "I want the api key hidden after the user provides it"
        // So we can collapse the UI
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKey(e.target.value);
        setIsSaved(false);
    };

    const handleClear = () => {
        localStorage.removeItem("gemini_api_key");
        setKey("");
        onKeyChange("");
        setIsSaved(false);
    };

    if (isSaved && key) {
        return (
            <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/40">
                        <Check size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">API Key Saved</p>
                        <p className="text-xs opacity-80">Using your secure key for accurate counts</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSaved(false)}
                    className="hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-800/40 dark:hover:text-green-300"
                >
                    Change Key
                </Button>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative w-full overflow-hidden rounded-2xl border transition-all duration-300",
            isFocused ? "border-blue-500/50 bg-blue-500/5 ring-4 ring-blue-500/10" : "border-zinc-200 bg-white/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50"
        )}>
            <div className="flex items-center px-4 py-3">
                <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                    <Key size={20} />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Gemini API Key
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type={isVisible ? "text" : "password"}
                            value={key}
                            onChange={handleChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="AIzaSy..."
                            className="w-full bg-transparent py-1 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                        title={isVisible ? "Hide key" : "Show key"}
                    >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>

                    <Button size="sm" onClick={handleSave} disabled={!key}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}
