
// Tính độ tương đồng Cosine giữa 2 vector (Range: -1 đến 1, càng gần 1 càng giống nhau)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
  
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
  
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Hàm làm sạch văn bản cơ bản trước khi embedding
export function cleanText(input: string): string {
    if (!input) return "";
    // Loại bỏ HTML tags và khoảng trắng thừa
    return input.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

// Parse CSV Nâng cao: Hỗ trợ Quotes và Newlines bên trong trường dữ liệu
export const parseCSV = (text: string) => {
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field
    let row = [];
    let col = '';
    let c = 0; 
    
    // Normalize newlines to \n to simplify
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (; c < text.length; c++) {
        let cc = text[c];
        let nc = text[c+1];

        // Check for escaped quote "" -> treat as literal quote "
        if (cc === '"' && quote && nc === '"') { 
            col += '"'; 
            c++; 
            continue; 
        }

        // Toggle quote status
        if (cc === '"') {
            quote = !quote;
            continue;
        }

        // Comma (field separator)
        if (cc === ',' && !quote) {
            row.push(col.trim());
            col = '';
            continue;
        }

        // Newline (row separator)
        if (cc === '\n' && !quote) {
            row.push(col.trim());
            col = '';
            if (row.length > 0 && row.some(x => x)) arr.push(row);
            row = [];
            continue;
        }

        // Normal character
        col += cc;
    }

    // Flush last item
    if (col || row.length > 0) {
        row.push(col.trim());
        if (row.length > 0 && row.some(x => x)) arr.push(row);
    }

    if (arr.length < 2) return [];

    const headers = arr[0].map(h => h.toLowerCase().trim());
    const data = arr.slice(1).map(r => {
        const obj: any = {};
        headers.forEach((h, i) => {
            obj[h] = r[i] || '';
        });
        return obj;
    });

    return data;
};
