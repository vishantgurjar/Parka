const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function normalizeFile(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const files = fs.readdirSync(filePath);
            files.forEach(file => normalizeFile(path.join(filePath, file)));
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
            const buffer = fs.readFileSync(filePath);
            
            // Heuristic to detect UTF-16
            let content;
            if (buffer[0] === 0xff && buffer[1] === 0xfe) {
                // UTF-16 LE with BOM
                content = buffer.toString('utf16le');
            } else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
                // UTF-16 BE with BOM
                content = buffer.toString('utf16be');
            } else {
                // Try to check if it has a lot of null bytes (typical for UTF-16 detected as ASCII)
                let nullCount = 0;
                for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
                    if (buffer[i] === 0) nullCount++;
                }
                
                if (nullCount > 100) {
                    content = buffer.toString('utf16le');
                } else {
                    content = buffer.toString('utf8');
                }
            }
            
            // Force save as UTF-8 (No BOM)
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Normalized: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

normalizeFile(directoryPath);
console.log('Normalization Complete!');
