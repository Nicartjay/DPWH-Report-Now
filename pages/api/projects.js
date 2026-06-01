// Next.js API route for DPWH project data proxy
// Handles DPWH API calls server-side to avoid CORS issues
// NOTE: DPWH API is protected by Cloudflare JS challenge.
// This proxy mimics a direct browser request without Origin/Referer
// which some Cloudflare configs allow through.

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

        // Mimic a direct browser navigation (no Origin, no Referer)
        // Some Cloudflare configs allow this through without challenge
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            },
            redirect: 'follow',
        });

        const contentType = response.headers.get('content-type') || '';

        // If Cloudflare returns an HTML challenge page, inform the client
        if (contentType.includes('text/html') || response.status === 403) {
            console.error(`[${new Date().toISOString()}] DPWH API blocked by Cloudflare (status: ${response.status}, type: ${contentType})`);
            return res.status(503).json({
                error: 'DPWH API is protected by Cloudflare and is currently blocking server requests.',
                cloudflare_blocked: true,
                suggestion: 'The API may be temporarily restricting automated access. Try again later.',
            });
        }

        if (!response.ok) {
            console.error(`[${new Date().toISOString()}] DPWH API error: ${response.status}`);
            return res.status(response.status).json({
                error: `DPWH API returned ${response.status}`,
            });
        }

        const data = await response.json();

        // Cache successful responses for 5 minutes to reduce upstream hits
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

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
