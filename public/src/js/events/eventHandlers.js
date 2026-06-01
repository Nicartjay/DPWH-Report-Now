// Event handlers setup

import { appState } from '../state/appState.js';
import { renderProjects, updateSummary } from '../ui/renderManager.js';
import { addProjectMarkers } from '../ui/markerManager.js';
import { openFilterPanel, closeFilterPanel, openListPanel, closeListPanel, closeAllPanels } from '../ui/panelManager.js';
import { closeReportModal } from '../ui/modalManager.js';
import { submitReport } from '../api/reportApi.js';
import { SHOW_ALL_DISTANCE, PERFORMANCE_WARNING_THRESHOLD } from '../config/constants.js';
import { showPerformanceWarning } from '../ui/warningModal.js';
import { updateStatusMessage } from '../ui/statusManager.js';
import { sendMessage } from '../services/aiChatService.js';

/**
 * Setup all event listeners for the application
 */
export function setupEventListeners() {
    // Distance filter dropdown
    document.getElementById('distanceFilter').addEventListener('change', async (e) => {
        const distanceFilter = e.target;
        const newDistance = parseFloat(distanceFilter.value);
        
        // Check if user is selecting "Show All" with large dataset
        if (newDistance === SHOW_ALL_DISTANCE) {
            const projectCount = appState.projects.length;
            
            if (projectCount > PERFORMANCE_WARNING_THRESHOLD) {
                const confirmed = await showPerformanceWarning(projectCount);
                
                if (!confirmed) {
                    // Revert to previous value
                    distanceFilter.value = appState.maxDistance;
                    return; // Don't update
                }
            }
        }
        
        appState.maxDistance = newDistance;
        
        // Update filteredProjects based on new distance
        if (newDistance < SHOW_ALL_DISTANCE) {
            appState.filteredProjects = appState.projects.filter(p =>
                p.distance !== undefined && p.distance <= newDistance
            );
        } else {
            appState.filteredProjects = appState.projects;
        }
        
        updateStatusMessage();
        updateSummary();
        renderProjects();
        addProjectMarkers();
    });

    // Type filter dropdown
    document.getElementById('typeFilter').addEventListener('change', (e) => {
        appState.currentTypeFilter = e.target.value;
        updateStatusMessage();
        renderProjects();
        addProjectMarkers();
        updateSummary();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.currentFilter = btn.dataset.filter;
            updateStatusMessage();
            renderProjects();
            addProjectMarkers();
        });
    });

    // Recenter button
    document.getElementById('recenterBtn').addEventListener('click', () => {
        if (appState.userLocation) {
            appState.map.setView([appState.userLocation.lat, appState.userLocation.lng], 16);
            updateStatusMessage();
        }
    });

    // Filter panel toggle
    document.getElementById('filterBtn').addEventListener('click', () => {
        openFilterPanel();
    });

    document.getElementById('filterClose').addEventListener('click', () => {
        closeFilterPanel();
    });

    // List panel toggle
    document.getElementById('listBtn').addEventListener('click', () => {
        openListPanel();
    });

    document.getElementById('listClose').addEventListener('click', () => {
        closeListPanel();
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('projectModal').classList.remove('active');
    });

    // Close modal on background click
    document.getElementById('projectModal').addEventListener('click', (e) => {
        if (e.target.id === 'projectModal') {
            document.getElementById('projectModal').classList.remove('active');
        }
    });

    // Close panels when clicking on map
    document.getElementById('map').addEventListener('click', () => {
        closeAllPanels();
    });
}

/**
 * Setup report modal event listeners
 */
export function setupReportModalListeners() {
    // Close report modal button
    const closeReportBtn = document.getElementById('reportModalClose');
    if (closeReportBtn) {
        closeReportBtn.addEventListener('click', closeReportModal);
    }

    // Report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', submitReport);
    }

    // File input change listener for preview
    const fileInput = document.getElementById('reportFiles');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            const preview = document.getElementById('filePreview');
            if (files.length > 0) {
                preview.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} selected`;
            } else {
                preview.textContent = '';
            }
        });
    }

    // Close modal when clicking outside
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) {
                closeReportModal();
            }
        });
    }
}

// Made with Bob

/**
 * Setup AI chat modal event listeners
 */
export function setupAIChatListeners() {
    // Open AI chat modal button
    const aiChatBtn = document.getElementById('aiChatBtn');
    if (aiChatBtn) {
        aiChatBtn.addEventListener('click', () => {
            const modal = document.getElementById('aiChatModal');
            if (modal) {
                modal.classList.add('active');
                // Focus on input when modal opens
                const input = document.getElementById('aiChatInput');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        });
    }

    // Close AI chat modal button
    const aiChatClose = document.getElementById('aiChatClose');
    if (aiChatClose) {
        aiChatClose.addEventListener('click', () => {
            const modal = document.getElementById('aiChatModal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Close modal when clicking outside
    const aiChatModal = document.getElementById('aiChatModal');
    if (aiChatModal) {
        aiChatModal.addEventListener('click', (e) => {
            if (e.target === aiChatModal) {
                aiChatModal.classList.remove('active');
            }
        });
    }

    // AI chat form submission
    const aiChatForm = document.getElementById('aiChatForm');
    if (aiChatForm) {
        aiChatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const input = document.getElementById('aiChatInput');
            const messagesContainer = document.getElementById('aiChatMessages');
            const sendBtn = aiChatForm.querySelector('.chat-send-btn');
            
            if (!input || !messagesContainer) return;
            
            const message = input.value.trim();
            if (!message) return;
            
            // Clear input and disable send button
            input.value = '';
            if (sendBtn) sendBtn.disabled = true;
            
            // Add user message to chat
            addChatMessage(messagesContainer, message, 'user');
            
            // Add loading indicator
            const loadingId = addLoadingMessage(messagesContainer);
            
            try {
                // Send message to AI service
                const response = await sendMessage(message);
                
                // Remove loading indicator
                removeLoadingMessage(messagesContainer, loadingId);
                
                // Add AI response to chat (response is now an object with text and isMarkdown)
                addChatMessage(messagesContainer, response.text, 'assistant', response.isMarkdown);
                
            } catch (error) {
                console.error('AI chat error:', error);
                
                // Remove loading indicator
                removeLoadingMessage(messagesContainer, loadingId);
                
                // Show error message
                const errorMsg = 'Sorry, I encountered an error. Please try again.';
                addChatMessage(messagesContainer, errorMsg, 'assistant');
            } finally {
                // Re-enable send button
                if (sendBtn) sendBtn.disabled = false;
                input.focus();
            }
        });
    }
}

/**
 * Add a chat message to the messages container
 * @param {HTMLElement} container - Messages container
 * @param {string} text - Message text
 * @param {string} role - 'user' or 'assistant'
 * @param {boolean} isMarkdown - Whether to render text as markdown (assistant only)
 */
function addChatMessage(container, text, role, isMarkdown = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<span class="material-icons">${role === 'user' ? 'person' : 'smart_toy'}</span>`;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // For assistant messages, check if we should render as markdown
    if (role === 'assistant' && isMarkdown) {
        // Convert markdown to HTML and render
        content.innerHTML = markdownToHtml(text);
    } else {
        // Escape HTML for user messages and non-markdown assistant messages
        content.innerHTML = `<p>${escapeHtml(text)}</p>`;
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    container.appendChild(messageDiv);
    
    // Scroll to bottom smoothly
    container.scrollTop = container.scrollHeight;
}

/**
 * Add a loading indicator message
 * @param {HTMLElement} container - Messages container
 * @returns {string} Loading message ID
 */
function addLoadingMessage(container) {
    const loadingId = `loading-${Date.now()}`;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant';
    messageDiv.id = loadingId;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<span class="material-icons">smart_toy</span>';
    
    const content = document.createElement('div');
    content.className = 'message-content loading';
    content.innerHTML = '<p>Thinking<span class="thinking-dots"><span>.</span><span>.</span><span>.</span></span></p>';
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    return loadingId;
}

/**
 * Remove a loading indicator message
 * @param {HTMLElement} container - Messages container
 * @param {string} loadingId - Loading message ID
 */
function removeLoadingMessage(container, loadingId) {
    const loadingMsg = document.getElementById(loadingId);
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

/**
 * Convert markdown to HTML
 * Supports headers, bold, italic, lists, links, and code blocks
 * @param {string} markdown - Markdown text
 * @returns {string} HTML string
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Escape HTML first to prevent XSS
    html = html.replace(/&/g, '&')
               .replace(/</g, '<')
               .replace(/>/g, '>');
    
    // Headers (h1-h6)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code (`code`)
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Links [text](url)
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Unordered lists (- item or * item)
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Ordered lists (1. item)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Line breaks (double newline = paragraph)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^(?!<[hul]|<pre)(.+)$/gm, '<p>$1</p>');
    
    // Clean up multiple paragraph tags
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<[hul])/g, '$1');
    html = html.replace(/(<\/[hul]>)<\/p>/g, '$1');
    
    return html;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
