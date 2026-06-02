// Next.js API route for DPWH project data proxy
// Attempts to fetch from DPWH API server-side.
// If Cloudflare blocks it, frontend falls back to popup challenge flow.

const DPWH_API_BASE = 'https://api.transparency.dpwh.gov.ph';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    try {
        const queryString = new URLSearchParams(req.query).toString();
        const apiUrl = `${DPWH_API_BASE}/projects${queryString ? '?' + queryString : ''}`;

        console.log(`[${new Date().toISOString()}] Proxying DPWH API: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
        });

        const contentType = response.headers.get('content-type') || '';

        // If Cloudflare returns HTML challenge page, return 503
        if (contentType.includes('text/html') || response.status === 403) {
            return res.status(503).json({
                error: 'DPWH API blocked by Cloudflare',
                cloudflare_blocked: true,
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: `DPWH API returned ${response.status}`,
            });
        }

        const data = await response.json();

        // Cache successful responses
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Proxy error:`, error.message);
        return res.status(500).json({
            error: 'Failed to fetch from DPWH API',
            details: error.message,
        });
    }
}

