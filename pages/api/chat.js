// Next.js API route for AI chat proxy
// Handles Langflow API calls server-side to avoid CORS issues

const LANGFLOW_API_ENDPOINT = process.env.LANGFLOW_API_ENDPOINT || '';
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || '';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { input_value, session_id } = req.body;

        // Validate required fields
        if (!input_value) {
            return res.status(400).json({
                error: 'Missing required field: input_value'
            });
        }

        // Validate API configuration
        if (!LANGFLOW_API_ENDPOINT || !LANGFLOW_API_KEY) {
            return res.status(500).json({
                error: 'AI service not configured. Set LANGFLOW_API_ENDPOINT and LANGFLOW_API_KEY environment variables.'
            });
        }

        // Build request payload
        const payload = {
            output_type: 'chat',
            input_type: 'chat',
            input_value
        };

        // Only include session_id if provided (not on first message)
        if (session_id) {
            payload.session_id = session_id;
            console.log(`[${new Date().toISOString()}] Proxying request to Langflow API - Session: ${session_id}`);
        } else {
            console.log(`[${new Date().toISOString()}] Proxying request to Langflow API - First message (no session)`);
        }

        console.log(`[${new Date().toISOString()}] Langflow API Endpoint: ${LANGFLOW_API_ENDPOINT}`);

        // Make request to Langflow API
        const response = await fetch(LANGFLOW_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': LANGFLOW_API_KEY,
            },
            body: JSON.stringify(payload),
        });

        console.log(`[${new Date().toISOString()}] Langflow API response status: ${response.status}`);
        console.log(`[${new Date().toISOString()}] Langflow API response content-type: ${response.headers.get('content-type')}`);

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        if (!isJson) {
            // Handle non-JSON responses (HTML, plain text, etc.)
            const responseText = await response.text();
            console.log(`[${new Date().toISOString()}] Langflow API returned non-JSON response (${contentType}):`, responseText.substring(0, 200));
            
            // Return the raw text in a structured format for display
            return res.status(200).json({
                output_value: responseText,
                is_plain_text: true,
                content_type: contentType || 'text/plain'
            });
        }

        // Get response data
        const data = await response.json();

        // Forward Langflow API response to client
        return res.status(response.status).json(data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Langflow API request error:`, error);
        return res.status(500).json({
            error: 'Failed to connect to Langflow API',
            details: error.message
        });
    }
}

// Made with Bob