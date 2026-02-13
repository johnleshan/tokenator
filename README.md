# Tokenator ⚡

**Tokenator** is a high-performance, privacy-focused web application designed to help developers and researchers optimize their context window usage for Google's Gemini models (specifically Gemini 2.5 Flash).

It allows you to upload multiple documents (PDF, DOCX, TXT, MD), instantly calculate their token counts using the official Gemini API, and visualize the distribution to ensure you stay within the **1 Million Token** limit.

![Tokenator Concept](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?style=for-the-badge&logo=google-gemini) ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=for-the-badge&logo=tailwind-css)

---

## 🚀 Key Features

-   **⚡ Parallel Processing**: Built with `Promise.all` to tokenize dozens of files simultaneously in seconds.
-   **🔒 Privacy First**: All processing happens client-side securely. Your API key is stored only in your browser's local storage.
-   **📊 Smart Visualization**:
    -   **Interactive Donut Charts**: See exactly which files are consuming your context window.
    -   **Context Usage Bar**: Real-time progress bar tracking against the 1M token limit.
    -   **Comparisons**: Side-by-side analysis of Token count vs. Character count.
-   **📑 Comprehensive Reports**: Generate and download professional PDF reports that include visual charts and detailed breakdowns.
-   **📄 Multi-Format Support**: Seamlessly handles `.pdf`, `.docx`, `.txt`, and `.md` files.
-   **💎 Premium UI**: A modern, glassmorphic interface with smooth animations powered by Framer Motion.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + `clsx` + `tailwind-merge`
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Visualizations**: [Recharts](https://recharts.org/)
-   **AI Integration**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
-   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
-   **File Parsing**: `pdfjs-dist` (PDFs), `mammoth` (DOCX)
-   **Animation**: `framer-motion`

## 📦 Getting Started

### Prerequisites

-   Node.js 18+ installed.
-   A Google Gemini API Key (Get one [here](https://aistudio.google.com/)).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/tokenator.git
    cd tokenator
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Visit `http://localhost:3000` in your browser.

## 💡 How to Use

1.  **Enter API Key**: Paste your Gemini API key. It will be saved locally for future use.
2.  **Upload Files**: Drag and drop your documents (PDF, DOCX, TXT, etc.) into the drop zone.
3.  **See Results**: Watch the "Tokenating..." animation as files are processed in parallel.
4.  **Analyze**: Review the charts to see which files are too large.
5.  **Report**: Click "Download Report" to get a PDF summary of your analysis.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
