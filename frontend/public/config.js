/**
 * FormatFlow Runtime Configuration
 *
 * If your NestJS backend API is hosted on a separate URL or subdomain (e.g., https://api.yourdomain.com),
 * set window.__API_URL__ below.
 *
 * When left empty:
 * - On localhost / 127.0.0.1: automatically points to http://localhost:3000
 * - In production: automatically calls relative / same-domain API routes (window.location.origin)
 */
window.__API_URL__ = 'https://api-fileforge.anythingforyou.in';
