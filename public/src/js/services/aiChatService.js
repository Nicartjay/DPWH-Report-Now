// AI Chat Service - handles API communication with Langflow via Next.js API route

// Next.js API route endpoint (avoids CORS issues)
const API_ENDPOINT = '/api/chat';

// Session management
const SESSION_KEY = 'dpwh_ai_session_id';
let currentSessionId = null;

/**
 * Get the current session ID (if any)
 * @returns {string|null} Session ID or null if no session exists
 */
function getSessionId() {
    // Return in-memory session ID if available
    if (currentSessionId) {
        return currentSessionId;
    }
    
    // Try to get from sessionStorage
    currentSessionId = sessionStorage.getItem(SESSION_KEY);
    return currentSessionId;
}

/**
 * Store the session ID returned from Langflow API
 * @param {string} sessionId - Session ID from API response
 */
function storeSessionId(sessionId) {
    if (sessionId) {
        currentSessionId = sessionId;
        sessionStorage.setItem(SESSION_KEY, sessionId);
        console.log('Stored AI chat session:', sessionId);
    }
}

/**
 * Send a message to the AI assistant
 * @param {string} message - User message to send
 * @returns {Promise<{text: string, isMarkdown: boolean}>} AI response with metadata
 * @throws {Error} If API request fails
 */
export async function sendMessage(message) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
    }
    
    const sessionId = getSessionId();
    
    const requestBody = {
        input_value: message.trim()
    };
    
    // Only include session_id if we have one (not on first message)
    if (sessionId) {
        requestBody.session_id = sessionId;
    }
    
    try {
        console.log('Sending message to AI:', { message: message.trim(), sessionId: sessionId || '(first message)' });
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        if (!response.ok) {
            // Try to get error details
            let errorMessage = `API request failed with status ${response.status}`;
            if (isJson) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (e) {
                    // Ignore JSON parse errors for error responses
                }
            }
            throw new Error(errorMessage);
        }
        
        // Ensure response is JSON (our API route always returns JSON)
        if (!isJson) {
            const responseText = await response.text();
            console.error('Non-JSON response received:', responseText.substring(0, 200));
            throw new Error('Server returned non-JSON response. Please ensure the API route is working correctly.');
        }
        
        const data = await response.json();
        
        // Debug: Log raw AI API response before any parsing/validation
        console.group('=== Raw AI Response (frontend) ===');
        console.log('Parsed object:', data);
        try {
            console.log('JSON stringified:', JSON.stringify(data, null, 2));
        } catch (stringifyError) {
            console.warn('Could not stringify raw AI response:', stringifyError);
        }
        console.groupEnd();
        
        console.log('AI response received:', data);
        
        // Store session_id from response for subsequent messages
        if (data.session_id) {
            storeSessionId(data.session_id);
        }
        
        // Check if this is a plain text/HTML response from upstream
        if (data.is_plain_text && data.output_value) {
            const contentType = data.content_type || '';
            const isHtml = contentType.includes('text/html');
            console.log('Received plain text response from upstream:', contentType, 'isHtml:', isHtml);
            // Return the raw text with metadata
            return {
                text: String(data.output_value),
                isMarkdown: false
            };
        }
        
        // Parse the response - handle Langflow response structure
        const aiResponse = parseAIResponse(data);
        
        if (!aiResponse) {
            console.error('Unable to extract AI response text from raw response:', data);
            throw new Error('Invalid response format from AI service');
        }
        
        // Markdown responses should be rendered as markdown
        return {
            text: aiResponse,
            isMarkdown: true
        };
        
    } catch (error) {
        console.error('AI chat error:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('non-JSON response')) {
            throw new Error('Unable to connect to AI service. Please check that the server is running correctly.');
        }
        
        throw new Error(`Failed to get AI response: ${error.message}`);
    }
}

/**
 * Parse AI response from Langflow response structure
 * Extracts the markdown text content from the nested response structure
 * @param {Object} data - Response data from API
 * @returns {string|null} Parsed markdown text or null if invalid
 */
function parseAIResponse(data) {
    const candidatePaths = [
        // Paths from actual logged response structure
        data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text,
        data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text,
        data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message,
        data?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message,
        data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message,
        // Additional common paths
        data?.outputs?.[0]?.outputs?.[0]?.results?.message,
        data?.outputs?.[0]?.outputs?.[0]?.results?.text,
        data?.outputs?.[0]?.outputs?.[0]?.artifacts?.text,
        data?.outputs?.[0]?.outputs?.[0]?.artifacts?.markdown,
        data?.outputs?.[0]?.artifacts?.message,
        data?.outputs?.[0]?.results?.message?.text,
        data?.outputs?.[0]?.results?.message,
        data?.outputs?.[0]?.messages?.[0]?.message,
        data?.outputs?.[0]?.messages?.[0]?.text,
        data?.output_value,
        data?.message,
        data?.text
    ];
    
    for (const candidate of candidatePaths) {
        if (typeof candidate === 'string') {
            const cleaned = cleanMarkdownResponse(candidate);
            if (cleaned) return cleaned;
        }
        
        if (candidate && typeof candidate === 'object') {
            const nestedTextCandidates = [
                candidate.text,
                candidate.message,
                candidate.content,
                candidate.markdown
            ];
            
            for (const nestedCandidate of nestedTextCandidates) {
                if (typeof nestedCandidate === 'string') {
                    const cleaned = cleanMarkdownResponse(nestedCandidate);
                    if (cleaned) return cleaned;
                }
            }
        }
    }
    
    return null;
}

/**
 * Clean markdown response by extracting the actual markdown content
 * Removes JSON wrappers, tool output, and other non-markdown content
 * @param {string} text - Raw text that may contain markdown
 * @returns {string|null} Clean markdown text or null
 */
function cleanMarkdownResponse(text) {
    if (!text || typeof text !== 'string') return null;
    
    const trimmedText = text.trim();
    
    // Return null for empty strings after trimming
    if (trimmedText.length === 0) return null;
    
    // Prefer the clean markdown body beginning with ## Summary when present
    const summaryIndex = trimmedText.indexOf('## Summary');
    if (summaryIndex !== -1) {
        return trimmedText.slice(summaryIndex).trim();
    }
    
    // If the text starts with markdown headers (##, ###, etc.), it's likely clean markdown
    if (/^#{1,6}\s+\w+/.test(trimmedText)) {
        return trimmedText;
    }
    
    // Look for markdown content that starts with any markdown header
    const markdownMatch = trimmedText.match(/#{1,6}\s+\w+[\s\S]*/);
    if (markdownMatch) {
        return markdownMatch[0].trim();
    }
    
    // Handle TOOL OUTPUT responses - extract final human-readable message
    if (trimmedText.startsWith('TOOL OUTPUT (complete, unmodified)')) {
        // Find the last substantial plain-text message after tool blocks
        // Split by double newlines to find paragraphs
        const paragraphs = trimmedText.split(/\n\n+/);
        
        // Look for the final readable message (not JSON, not tool wrapper)
        for (let i = paragraphs.length - 1; i >= 0; i--) {
            const para = paragraphs[i].trim();
            
            // Skip empty paragraphs
            if (!para) continue;
            
            // Skip JSON blocks
            if (para.startsWith('{') || para.startsWith('[')) continue;
            
            // Skip tool output headers
            if (para.includes('TOOL OUTPUT') || para.includes('complete, unmodified')) continue;
            
            // Found a readable message - return it
            if (para.length > 10) {
                return para;
            }
        }
    }
    
    // Remove tool output blocks if present (fallback)
    let cleaned = text.replace(/TOOL OUTPUT \(complete, unmodified\)[\s\S]*?(?=\n\n#{1,6}|\n#{1,6}|$)/gi, '').trim();
    
    // Remove JSON object/array blocks at the start
    cleaned = cleaned.replace(/^[\s\S]*?(\{[\s\S]*?\}|\[[\s\S]*?\])\s*/g, '').trim();
    
    // If we still have content starting with markdown, return it
    if (/^#{1,6}\s+\w+/.test(cleaned)) {
        return cleaned;
    }
    
    // As a fallback, return the cleaned text if it's substantial
    if (cleaned.length > 20) {
        return cleaned;
    }
    
    // CRITICAL FIX: Accept any non-empty trimmed text as valid
    // This ensures we don't reject valid responses that don't match specific patterns
    // The original trimmedText is returned here (not cleaned) to preserve the full response
    return trimmedText;
}

/**
 * Reset the current session (creates a new session ID)
 * Useful for starting a fresh conversation
 */
export function resetSession() {
    currentSessionId = null;
    sessionStorage.removeItem(SESSION_KEY);
    console.log('AI chat session reset');
}

// Made with Bob
