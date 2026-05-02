// Configuration
const CONFIG = {
    API_BASE_URL: 'https://ats-pro-system.onrender.com',
    MAX_FILE_SIZE: 10 * 1024 * 1024, 
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
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
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
    
    // Prevent default drag behavior
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
    // Validate file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        showToast(`Invalid file type. Allowed: ${CONFIG.ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`, 'error');
        return;
    }
    
    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast(`File too large. Maximum size: ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`, 'error');
        return;
    }
    
    // Set file
    state.selectedFile = file;
    displayFilePreview(file);
    updateAnalyzeButtonState();
    showToast('File uploaded successfully', 'success');
}

function displayFilePreview(file) {
    // Hide upload label, show preview
    elements.fileLabel.style.display = 'none';
    elements.filePreview.style.display = 'flex';
    
    // Set file details
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    
    // Set appropriate icon
    const extension = file.name.split('.').pop().toLowerCase();
    const iconClass = getFileIcon(extension);
    const icon = elements.filePreview.querySelector('.file-type-icon');
    icon.className = `fas ${iconClass} file-type-icon`;
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
    
    // Show loading
    showLoading();
    
    try {
        // Simulate progress
        simulateProgress();
        
        // Prepare form data
        const formData = new FormData();
        formData.append('resume_file', state.selectedFile);
        formData.append('jd_text', elements.jobDescription.value.trim());
        
        // Make API call
        const response = await fetch(`${CONFIG.API_BASE_URL}/evaluate/`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Analysis failed');
        }
        
        const result = await response.json();
        state.analysisResult = result;
        
        // Hide loading, show results
        hideLoading();
        displayResults(result);
        showToast('Analysis complete!', 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        hideLoading();
        showToast(error.message || 'Failed to analyze resume. Please try again.', 'error');
    } finally {
        state.isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.classList.remove('loading');
    }
}

function simulateProgress() {
    const steps = [
        { text: 'Uploading resume...', delay: 500 },
        { text: 'Extracting text content...', delay: 1000 },
        { text: 'Generating embeddings...', delay: 1500 },
        { text: 'Analyzing semantic similarity...', delay: 2000 },
        { text: 'Extracting keywords...', delay: 2500 },
        { text: 'Calculating final score...', delay: 3000 },
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            elements.loadingText.textContent = steps[currentStep].text;
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 500);
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
    // Show results section
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        window.scrollTo({ top: elements.resultsSection.offsetTop - 100, behavior: 'smooth' });
    }, 100);
    
    // Display scores
    displayScores(result);
    
    // Display missing keywords
    displayMissingKeywords(result);
    
    // Generate recommendations
    generateRecommendations(result);
    
    // Display breakdown
    displayBreakdown(result);
}

function displayScores(result) {
    const { final_score, semantic_score, keyword_score } = result;
    
    // Final Score
    animateScore(elements.finalScore, final_score, '%');
    animateProgressBar(elements.finalScoreBar, final_score);
    elements.scoreStatus.textContent = getScoreStatus(final_score);
    
    // Semantic Score
    animateScore(elements.semanticScore, semantic_score, '%');
    animateProgressBar(elements.semanticScoreBar, semantic_score);
    
    // Keyword Score
    animateScore(elements.keywordScore, keyword_score, '%');
    animateProgressBar(elements.keywordScoreBar, keyword_score);
}

function animateScore(element, targetValue, suffix = '') {
    let currentValue = 0;
    const increment = targetValue / 50; // 50 steps
    const duration = 1500; // 1.5 seconds
    const stepTime = duration / 50;
    
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
    
    // Score-based recommendations
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
    
    // Semantic score recommendations
    if (semantic_score < 60) {
        recommendations.push({
            icon: 'fa-brain',
            text: 'Low semantic alignment suggests experience may not directly match the role context.',
        });
    }
    
    // Keyword recommendations
    if (keyword_score < 50) {
        recommendations.push({
            icon: 'fa-key',
            text: 'Multiple required skills are missing. Verify if the candidate has equivalent competencies.',
        });
    }
    
    // Missing keywords recommendations
    if (total_missing_keywords > 10) {
        recommendations.push({
            icon: 'fa-list-check',
            text: 'Significant skill gaps detected. Assess if training/upskilling is feasible.',
        });
    } else if (total_missing_keywords > 5) {
        recommendations.push({
            icon: 'fa-chart-line',
            text: 'Some skill gaps present. Consider the candidate\'s learning ability and growth potential.',
        });
    }
    
    // Display recommendations
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
    const { semantic_score, keyword_score } = result;
    
    // Semantic breakdown (60% weight)
    const semanticContribution = (semantic_score * 0.6).toFixed(2);
    animateProgressBar(elements.semanticBreakdown, semantic_score);
    elements.semanticBreakdownValue.textContent = semanticContribution;
    
    // Keyword breakdown (40% weight)
    const keywordContribution = (keyword_score * 0.4).toFixed(2);
    animateProgressBar(elements.keywordBreakdown, keyword_score);
    elements.keywordBreakdownValue.textContent = keywordContribution;
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

function clearAll() {
    // Reset file
    removeFile();
    
    // Clear job description
    elements.jobDescription.value = '';
    elements.charCount.textContent = '0';
    
    // Hide results
    elements.resultsSection.style.display = 'none';
    
    // Reset state
    state.selectedFile = null;
    state.analysisResult = null;
    
    // Update button state
    updateAnalyzeButtonState();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showToast('Form cleared', 'info');
}

function exportResults() {
    if (!state.analysisResult) {
        showToast('No results to export', 'error');
        return;
    }
    
    const { final_score, semantic_score, keyword_score, missing_keywords, total_missing_keywords } = state.analysisResult;
    
    // Create export data
    const exportData = {
        timestamp: new Date().toISOString(),
        resume_file: state.selectedFile?.name || 'Unknown',
        scores: {
            final_score: final_score,
            semantic_score: semantic_score,
            keyword_score: keyword_score,
        },
        missing_keywords: missing_keywords,
        total_missing_keywords: total_missing_keywords,
        status: getScoreStatus(final_score),
    };
    
    // Create and download JSON file
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
    
    // Set icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
    };
    
    icon.className = `toast-icon fas ${icons[type] || icons.info}`;
    
    // Set colors based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Show message
    elements.toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
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
        const response = await fetch(`${CONFIG.API_BASE_URL}/health/`);
        if (response.ok) {
            console.log('✅ Backend is healthy');
        } else {
            console.warn('⚠️ Backend health check failed');
            showToast('Warning: Backend connection issue detected', 'warning');
        }
    } catch (error) {
        console.error('❌ Backend is not reachable:', error);
        showToast('Cannot connect to backend server. Please ensure it is running.', 'error');
    }
}

/* ==========================================
   KEYBOARD SHORTCUTS
   ========================================== */

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus job description
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.jobDescription.focus();
    }
    
    // Ctrl/Cmd + Enter: Analyze (if button is enabled)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!elements.analyzeBtn.disabled) {
            e.preventDefault();
            analyzeResume();
        }
    }
    
    // Ctrl/Cmd + R: Clear all
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        clearAll();
    }
    
    // Ctrl/Cmd + D: Toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }
});

/* ==========================================
   EXPORT FOR DEBUGGING
   ========================================== */

// Make state available for debugging in console
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
