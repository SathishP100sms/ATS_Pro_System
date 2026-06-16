// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api',
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    API_TIMEOUT: 120000,
    ALLOWED_EXTENSIONS: ['pdf', 'docx', 'txt'],
    THEME_STORAGE_KEY: 'ats-theme',
};

// State Management
const state = {
    selectedFile: null,
    analysisResult: null,
    isAnalyzing: false,
};

// DOM Elements
const elements = {
    // File Upload
    resumeFile: document.getElementById('resumeFile'),
    fileLabel: document.getElementById('fileLabel'),
    filePreview: document.getElementById('filePreview'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    fileRemove: document.getElementById('fileRemove'),

    // Job Description
    jobDescription: document.getElementById('jobDescription'),
    charCount: document.getElementById('charCount'),

    // Buttons
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    exportBtn: document.getElementById('exportBtn'),
    themeToggle: document.getElementById('themeToggle'),

    // Sections
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),
    loadingText: document.getElementById('loadingText'),
    loadingProgress: document.getElementById('loadingProgress'),

    // Results
    finalScore: document.getElementById('finalScore'),
    finalScoreBar: document.getElementById('finalScoreBar'),
    scoreStatus: document.getElementById('scoreStatus'),
    semanticScore: document.getElementById('semanticScore'),
    semanticScoreBar: document.getElementById('semanticScoreBar'),
    keywordScore: document.getElementById('keywordScore'),
    keywordScoreBar: document.getElementById('keywordScoreBar'),
    missingKeywords: document.getElementById('missingKeywords'),
    missingCount: document.getElementById('missingCount'),
    recommendations: document.getElementById('recommendations'),
    semanticBreakdown: document.getElementById('semanticBreakdown'),
    semanticBreakdownValue: document.getElementById('semanticBreakdownValue'),
    keywordBreakdown: document.getElementById('keywordBreakdown'),
    keywordBreakdownValue: document.getElementById('keywordBreakdownValue'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
};

/* ==========================================
   INITIALIZATION
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    attachEventListeners();
    checkBackendHealth();
});

/* ==========================================
   THEME MANAGEMENT
   ========================================== */

function initializeTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY) || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme);

    const icon = elements.themeToggle.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} mode`);
}

/* ==========================================
   EVENT LISTENERS
   ========================================== */

function attachEventListeners() {
    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // File Upload
    elements.resumeFile.addEventListener('change', handleFileSelect);
    elements.fileRemove.addEventListener('click', removeFile);

    // Drag and Drop
    elements.fileLabel.addEventListener('dragover', handleDragOver);
    elements.fileLabel.addEventListener('dragleave', handleDragLeave);
    elements.fileLabel.addEventListener('drop', handleFileDrop);

    // Job Description
    elements.jobDescription.addEventListener('input', handleJobDescriptionInput);

    // Buttons
    elements.analyzeBtn.addEventListener('click', analyzeResume);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.exportBtn.addEventListener('click', exportResults);

    // Prevent default drag behavior on body
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/* ==========================================
   FILE HANDLING
   ========================================== */

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndSetFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.fileLabel.style.borderColor = 'var(--color-primary)';
    elements.fileLabel.style.backgroundColor = 'var(--color-bg-tertiary)';
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.fileLabel.style.borderColor = 'var(--color-border)';
    elements.fileLabel.style.backgroundColor = 'var(--color-bg-secondary)';
}

function handleFileDrop(e) {
    e.preventDefault();
    elements.fileLabel.style.borderColor = 'var(--color-border)';
    elements.fileLabel.style.backgroundColor = 'var(--color-bg-secondary)';

    const file = e.dataTransfer.files[0];
    if (file) {
        validateAndSetFile(file);
    }
}

function validateAndSetFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        showToast(`Invalid file type. Allowed: ${CONFIG.ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`, 'error');
        return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast(`File too large. Maximum size: ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`, 'error');
        return;
    }

    state.selectedFile = file;
    displayFilePreview(file);
    updateAnalyzeButtonState();
    showToast('File uploaded successfully', 'success');
}

function displayFilePreview(file) {
    elements.fileLabel.style.display = 'none';
    elements.filePreview.style.display = 'flex';

    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);

    const extension = file.name.split('.').pop().toLowerCase();
    const iconClass = getFileIcon(extension);
    const icon = elements.filePreview.querySelector('.file-type-icon');

    // FIX: null check before modifying icon
    if (icon) {
        icon.className = `fas ${iconClass} file-type-icon`;
    }
}

function removeFile() {
    state.selectedFile = null;
    elements.resumeFile.value = '';
    elements.fileLabel.style.display = 'block';
    elements.filePreview.style.display = 'none';
    updateAnalyzeButtonState();
    showToast('File removed', 'info');
}

function getFileIcon(extension) {
    const icons = {
        pdf: 'fa-file-pdf',
        docx: 'fa-file-word',
        txt: 'fa-file-alt',
    };
    return icons[extension] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/* ==========================================
   JOB DESCRIPTION HANDLING
   ========================================== */

function handleJobDescriptionInput(e) {
    const text = e.target.value;
    elements.charCount.textContent = text.length.toLocaleString();
    updateAnalyzeButtonState();
}

function updateAnalyzeButtonState() {
    const hasFile = state.selectedFile !== null;
    const hasJobDescription = elements.jobDescription.value.trim().length > 0;
    elements.analyzeBtn.disabled = !(hasFile && hasJobDescription);
}

/* ==========================================
   ANALYSIS WORKFLOW
   ========================================== */

async function analyzeResume() {
    if (state.isAnalyzing) return;

    state.isAnalyzing = true;
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.classList.add('loading');

    showLoading();

    // FIX: store interval ID so we can clear it on error/completion
    const progressInterval = simulateProgress();

    try {
        const formData = new FormData();
        formData.append('resume_file', state.selectedFile);
        formData.append('jd_text', elements.jobDescription.value.trim());

        console.log(
    'Sending request:',
    {
        file: state.selectedFile?.name,
        jdLength:
            elements.jobDescription.value.length
    }
);

        // FIX: added AbortController for timeout support
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

        const response = await fetch(`${CONFIG.API_BASE_URL}/evaluate/`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(
    'Response status:',
    response.status
);

        if (!response.ok) {
            let errorMessage = 'Analysis failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(
    `[${response.status}] ${errorMessage}`
);
        }

        let result;
        try {
            result = await response.json();
        } catch (e) {
            throw new Error('Failed to parse server response. Please ensure the backend is running correctly.');
        }

        state.analysisResult = result;

        // FIX: clear progress interval on success
        clearInterval(progressInterval);

        hideLoading();
        displayResults(result);
        showToast('Analysis complete!', 'success');

    } catch (error) {
        console.error('Analysis error:', error);

        // FIX: clear progress interval on error too
        clearInterval(progressInterval);

        hideLoading();

        const errorMsg = error.name === 'AbortError'
            ? 'Request timed out. Please check your connection and try again.'
            : error.message || 'Failed to analyze resume. Please try again.';

        showToast(errorMsg, 'error');
    } finally {
        state.isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.classList.remove('loading');
        updateAnalyzeButtonState();
    }
}

// FIX: returns interval ID so caller can clear it
function simulateProgress() {
    const steps = [
        'Uploading resume...',
        'Extracting text content...',
        'Generating embeddings...',
        'Analyzing semantic similarity...',
        'Extracting keywords...',
        'Calculating final score...',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            if (elements.loadingText) {
                elements.loadingText.textContent = steps[currentStep];
            }
            currentStep++;
        }
    }, 1000);

    return interval;
}

function showLoading() {
    elements.loadingSection.style.display = 'block';
    elements.resultsSection.style.display = 'none';
    window.scrollTo({ top: elements.loadingSection.offsetTop - 100, behavior: 'smooth' });
}

function hideLoading() {
    elements.loadingSection.style.display = 'none';
}

/* ==========================================
   RESULTS DISPLAY
   ========================================== */

function displayResults(result) {
    elements.resultsSection.style.display = 'block';

    setTimeout(() => {
        window.scrollTo({ top: elements.resultsSection.offsetTop - 100, behavior: 'smooth' });
    }, 100);

    displayScores(result);
    displayMissingKeywords(result);
    generateRecommendations(result);
    displayBreakdown(result);
}

function displayScores(result) {

    const finalScore =
        Math.round(result.final_score * 100);

    const semanticScore =
        Math.round(result.semantic_score * 100);

    const keywordScore =
        Math.round(result.keyword_score * 100);

    animateScore(
        elements.finalScore,
        finalScore,
        '%'
    );

    animateProgressBar(
        elements.finalScoreBar,
        finalScore
    );

    elements.scoreStatus.textContent =
        getScoreStatus(finalScore);

    animateScore(
        elements.semanticScore,
        semanticScore,
        '%'
    );

    animateProgressBar(
        elements.semanticScoreBar,
        semanticScore
    );

    animateScore(
        elements.keywordScore,
        keywordScore,
        '%'
    );

    animateProgressBar(
        elements.keywordScoreBar,
        keywordScore
    );
}

function animateScore(element, targetValue, suffix = '') {
    let currentValue = 0;
    const increment = targetValue / 50;
    const stepTime = 1500 / 50;

    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(currentValue) + suffix;
    }, stepTime);
}

function animateProgressBar(element, percentage) {
    setTimeout(() => {
        element.style.width = percentage + '%';
    }, 100);
}

function getScoreStatus(score) {
    if (score >= 90) return '🎉 Excellent Match - Highly Recommended';
    if (score >= 75) return '✅ Strong Match - Recommended';
    if (score >= 60) return '👍 Good Match - Consider';
    if (score >= 45) return '⚠️ Moderate Match - Review Carefully';
    return '❌ Weak Match - Not Recommended';
}

function displayMissingKeywords(result) {
    const { missing_keywords, total_missing_keywords } = result;

    elements.missingCount.textContent = total_missing_keywords || 0;

    if (!missing_keywords || missing_keywords.length === 0) {
        elements.missingKeywords.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>All key requirements are present!</p>
            </div>
        `;
    } else {
        elements.missingKeywords.innerHTML = missing_keywords
            .map(keyword => `
                <div class="keyword-tag">
                    <i class="fas fa-times-circle"></i>
                    <span>${escapeHtml(keyword)}</span>
                </div>
            `)
            .join('');
    }
}

function generateRecommendations(result) {
    const { final_score, semantic_score, keyword_score, total_missing_keywords } = result;
    const recommendations = [];

    if (final_score >= 75) {
        recommendations.push({
            icon: 'fa-thumbs-up',
            text: 'Strong candidate profile. Proceed with interview process.',
        });
    } else if (final_score >= 60) {
        recommendations.push({
            icon: 'fa-user-check',
            text: 'Candidate shows potential. Consider for further evaluation.',
        });
    } else {
        recommendations.push({
            icon: 'fa-exclamation-triangle',
            text: 'Significant gaps identified. Carefully review if core requirements are met.',
        });
    }

    if (semantic_score < 60) {
        recommendations.push({
            icon: 'fa-brain',
            text: 'Low semantic alignment suggests experience may not directly match the role context.',
        });
    }

    if (keyword_score < 50) {
        recommendations.push({
            icon: 'fa-key',
            text: 'Multiple required skills are missing. Verify if the candidate has equivalent competencies.',
        });
    }

    if (total_missing_keywords > 10) {
        recommendations.push({
            icon: 'fa-list-check',
            text: 'Significant skill gaps detected. Assess if training/upskilling is feasible.',
        });
    } else if (total_missing_keywords > 5) {
        recommendations.push({
            icon: 'fa-chart-line',
            text: "Some skill gaps present. Consider the candidate's learning ability and growth potential.",
        });
    }

    elements.recommendations.innerHTML = recommendations
        .map(rec => `
            <div class="recommendation-item">
                <i class="fas ${rec.icon} recommendation-icon"></i>
                <p class="recommendation-text">${rec.text}</p>
            </div>
        `)
        .join('');
}

function displayBreakdown(result) {

    const semanticPercent =
        result.semantic_score * 100;

    const keywordPercent =
        result.keyword_score * 100;

    const semanticContribution =
        (semanticPercent * 0.7).toFixed(2);

    const keywordContribution =
        (keywordPercent * 0.3).toFixed(2);

    animateProgressBar(
        elements.semanticBreakdown,
        semanticPercent
    );

    animateProgressBar(
        elements.keywordBreakdown,
        keywordPercent
    );

    elements.semanticBreakdownValue.textContent =
        semanticContribution;

    elements.keywordBreakdownValue.textContent =
        keywordContribution;
}  elements.keywordBreakdownValue.textContent = keywordContribution;


/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

function clearAll() {
    removeFile();

    elements.jobDescription.value = '';
    elements.charCount.textContent = '0';
    elements.resultsSection.style.display = 'none';

    state.selectedFile = null;
    state.analysisResult = null;

    updateAnalyzeButtonState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Form cleared', 'info');
}

function exportResults() {
    if (!state.analysisResult) {
        showToast('No results to export', 'error');
        return;
    }

    const { final_score, semantic_score, keyword_score, missing_keywords, total_missing_keywords } = state.analysisResult;

    const exportData = {
        timestamp: new Date().toISOString(),
        resume_file: state.selectedFile?.name || 'Unknown',
        scores: {
            final_score,
            semantic_score,
            keyword_score,
        },
        missing_keywords,
        total_missing_keywords,
        status: getScoreStatus(final_score),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Results exported successfully', 'success');
}

function showToast(message, type = 'info') {
    const toast = elements.toast;
    const icon = toast.querySelector('.toast-icon');

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
    };

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    };

    if (icon) {
        icon.className = `toast-icon fas ${icons[type] || icons.info}`;
    }

    toast.style.backgroundColor = colors[type] || colors.info;
    elements.toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function checkBackendHealth() {
    try {

        const controller = new AbortController();

        const timeoutId = setTimeout(
            () => controller.abort(),
            5000
        );

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/health/`,
            {
                method: 'GET',
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Backend healthy:', data);

    } catch (error) {

        console.error(
            '❌ Backend unreachable:',
            error
        );

        showToast(
            'Backend server unavailable',
            'error'
        );
    }
}

/* ==========================================
   KEYBOARD SHORTCUTS
   ========================================== */

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.jobDescription.focus();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!elements.analyzeBtn.disabled) {
            e.preventDefault();
            analyzeResume();
        }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        clearAll();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }
});

/* ==========================================
   EXPORT FOR DEBUGGING
   ========================================== */

window.ATSDebug = {
    state,
    config: CONFIG,
    checkBackendHealth,
};

console.log('%c🚀 ATS Pro Initialized', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cKeyboard Shortcuts:', 'color: #7c3aed; font-weight: bold;');
console.log('  Ctrl/Cmd + K: Focus job description');
console.log('  Ctrl/Cmd + Enter: Analyze resume');
console.log('  Ctrl/Cmd + R: Clear all');
console.log('  Ctrl/Cmd + D: Toggle dark mode');
console.log('%cDebug mode: window.ATSDebug', 'color: #10b981;');
