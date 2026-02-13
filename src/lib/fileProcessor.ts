import mammoth from 'mammoth';

export async function extractText(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'txt':
        case 'md':
            return await readTextFile(file);
        case 'pdf':
            return await readPdfFile(file);
        case 'docx':
            return await readDocxFile(file);
        default:
            throw new Error('Unsupported file type');
    }
}

function readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

async function readPdfFile(file: File): Promise<string> {
    // Dynamically import pdfjs-dist to avoid SSR issues (DOMMatrix not defined)
    const pdfjsLib = await import('pdfjs-dist');

    // Initialize worker if needed
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(' ') + '\n';
    }

    return text;
}

async function readDocxFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}
