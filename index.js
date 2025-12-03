// Initialize Lucide icons
lucide.createIcons();

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const bgColorInput = document.getElementById('bg-color');
const bgColorText = document.getElementById('bg-color-text');
const resultsSection = document.getElementById('results-section');
const preview192 = document.getElementById('preview-192');
const preview512 = document.getElementById('preview-512');
const downloadBtn192 = document.getElementById('download-192');
const downloadBtn512 = document.getElementById('download-512');
const downloadAllBtn = document.getElementById('download-all-btn');

// State
let currentImage = null; // Holds the Image object
let currentFileName = '';

// --- Event Listeners ---

// File Upload Handling
fileInput.addEventListener('change', handleFileSelect);

// Drag & Drop Handling
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
    }
});

// Color Picker Handling
bgColorInput.addEventListener('input', (e) => {
    bgColorText.value = e.target.value;
    if (currentImage) processImages();
});

bgColorText.addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
        bgColorInput.value = val;
        if (currentImage) processImages();
    }
});

// Download All
downloadAllBtn.addEventListener('click', () => {
    downloadBtn192.click();
    setTimeout(() => {
        downloadBtn512.click();
    }, 500); // Small delay to ensure browser handles both downloads
});

// --- Core Functions ---

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (PNG, JPG, SVG, etc).');
        return;
    }

    currentFileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            resultsSection.classList.remove('hidden');
            // Scroll to results smoothly
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            processImages();
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function processImages() {
    if (!currentImage) return;

    const bgColor = bgColorInput.value;

    // Generate 192x192
    const dataUrl192 = generateIcon(currentImage, 192, bgColor);
    preview192.src = dataUrl192;
    downloadBtn192.href = dataUrl192;
    
    // Generate 512x512
    const dataUrl512 = generateIcon(currentImage, 512, bgColor);
    preview512.src = dataUrl512;
    downloadBtn512.href = dataUrl512;
}

/**
 * Generates a square PNG icon with the specified background color.
 * Uses 'object-fit: contain' logic to center the image.
 */
function generateIcon(img, size, backgroundColor) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Fill Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // 2. Calculate scaling to fit image within canvas (Contain)
    // We want a little bit of padding usually, but strict 'contain' is safer for general tools.
    // If you want padding, reduce target dimensions slightly in calculations.
    
    const scale = Math.min(size / img.width, size / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    
    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;

    // 3. Draw Image
    // Use high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    return canvas.toDataURL('image/png');
}
