// Next.js API route for DPWH project data proxy
// Uses http-proxy-middleware to create a true HTTP proxy pipe
// This streams the connection directly (not fetch), which has
// different TLS fingerprinting and often bypasses Cloudflare

import { createProxyMiddleware } from 'http-proxy-middleware';

const DPWH_API_BASE = 'https://api.transparency.dpwh.gov.ph';

// Create reusable proxy instance
const proxy = createProxyMiddleware({
    target: DPWH_API_BASE,
    changeOrigin: true,
    pathRewrite: {
        '^/api/projects': '/projects',
    },
    // Remove headers that identify this as a proxy request
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-forwarded-host');
        proxyReq.removeHeader('x-forwarded-proto');
        proxyReq.removeHeader('x-real-ip');
        // Set browser-like headers
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
        proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
        proxyReq.setHeader('Connection', 'keep-alive');
    },
    onError: (err, req, res) => {
        console.error(`[${new Date().toISOString()}] Proxy error:`, err.message);
        res.status(502).json({
            error: 'Failed to proxy request to DPWH API',
            details: err.message,
        });
    },
});

// Disable Next.js body parsing - proxy needs raw stream
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    console.log(`[${new Date().toISOString()}] Proxying: ${req.url}`);

    return proxy(req, res);
}

// Made with Bob
