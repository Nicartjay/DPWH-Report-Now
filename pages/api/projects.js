// Next.js API route for DPWH project data proxy
// Handles DPWH API calls server-side to avoid CORS issues

const DPWH_API_BASE = 'https://api.transparency.dpwh.gov.ph';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    try {
        // Forward query parameters to DPWH API
        const queryString = new URLSearchParams(req.query).toString();
        const apiUrl = `${DPWH_API_BASE}/projects${queryString ? '?' + queryString : ''}`;

        console.log(`[${new Date().toISOString()}] Proxying DPWH API request: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`[${new Date().toISOString()}] DPWH API error: ${response.status}`);
            return res.status(response.status).json({
                error: `DPWH API returned ${response.status}`,
            });
        }

        const data = await response.json();

        // Forward response to client
        return res.status(200).json(data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] DPWH API proxy error:`, error);
        return res.status(500).json({
            error: 'Failed to fetch projects from DPWH API',
            details: error.message,
        });
    }
}

// Made with Bob
