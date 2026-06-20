# Scraper API

Production-ready, configuration-driven Node.js scraping API for Flutter mobile apps. Deploy on a Hetzner VPS with PM2.

## Tech Stack

- **Node.js** + **Express** – HTTP API
- **Axios** – HTTP client
- **Cheerio** – HTML parsing
- **NodeCache** – in-memory cache (8-hour TTL)
- **dotenv** – environment configuration
- **PM2** – process manager

## Project Structure

```
scraper-api/
├── server.js                 # Entry point
├── configs/                  # Site-specific selectors & pagination (no hardcoded selectors in services)
├── controllers/
├── routes/
├── services/                 # Generic scraper engine, cache, watch extractor
├── utils/
├── middleware/
├── constants/
├── cache/                    # Reserved for future file-based cache
├── logs/                     # PM2 logs
├── .env.example            # Template – copy to .env (not committed)
├── ecosystem.config.js
└── package.json
```

## Data Sources

| API | Source site | Config |
|-----|-------------|--------|
| `/api/home` | website1.com | `home.config.js` |
| `/api/models` | website2.com | `models.config.js` |
| `/api/model-section` | website2.com (parent URL from app) | `model-section.config.js` |
| `/api/tags` | website3.com | `tags.config.js` |
| `/api/tag-section` | website3.com (parent URL from app) | `tag-section.config.js` |
| `/api/channels` | website4.com | `channels.config.js` |
| `/api/channel-section` | website4.com (parent URL from app) | `channel-section.config.js` |
| `/api/watch` | all sites | `watch.config.js` |

## API Endpoints

All list/section endpoints return:

```json
[
  { "title": "...", "img": "...", "url": "..." }
]
```

| Method | Endpoint | Query params |
|--------|----------|--------------|
| GET | `/api/home` | `page` (default 1) |
| GET | `/api/models` | `page` |
| GET | `/api/model-section` | `url` (required), `page` |
| GET | `/api/tags` | `page` |
| GET | `/api/tag-section` | `url` (required), `page` |
| GET | `/api/channels` | `page` |
| GET | `/api/channel-section` | `url` (required), `page` |
| GET | `/api/watch` | `url` (required) |
| GET | `/health` | – |

### Authentication

When `API_KEY` is set in `.env`, every request (including `/health`) must include the key:

```bash
curl -H "X-Api-Key: your-secret-api-key-here" "http://localhost:3000/api/home?page=1"
# or
curl -H "Authorization: Bearer your-secret-api-key-here" "http://localhost:3000/api/home?page=1"
```

Copy `.env.example` to `.env` and set `API_KEY` before deploying. Leave `API_KEY` unset only for local development without auth.

### Examples

```bash
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/home?page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/models?page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/model-section?url=https://www.xvideos.com/amateurs/khaykhaymm2&page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/tags?page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/tag-section?url=https://www.xvideos.com/tags/myanmar&page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/channels?page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/channel-section?url=https://www.xvideos.com/myanma_porn&page=1"
curl -H "X-Api-Key: $API_KEY" "http://localhost:3000/api/watch?url=https://www.xvideos.com/video.xxx/title"
```

## Caching

- All responses cached **8 hours** (28800 seconds)
- Override with `CACHE_TTL` in `.env`
- Cache key = endpoint + page + parent URL (for sections)
- Fresh scrape only after TTL expires

## Configuration

**Never hardcode selectors in services.** Edit the matching config file when a target site changes:

```js
// configs/home.config.js
selectors: {
  item: ".thumb-block",
  title: { selector: ".thumb-under .title a", attr: "text" },
  img:   { selector: ".thumb img", attrs: ["data-src", "src"] },
  url:   { selector: ".title a[href*='/video.']", attr: "href", absolute: true },
},
pagination: {
  type: "pathSuffix",
  buildPath: (listPath, page) => page <= 1 ? listPath : `${listPath}/${page - 1}`,
},
```

Section endpoints use `parseParentUrl()` to derive scrape paths from the Flutter-provided URL — the API **never generates** section URLs.

## Local Development

```bash
cd scraper-api
cp .env.example .env   # Windows: copy .env.example .env
# Edit .env – set API_KEY and site URLs
npm install
npm run dev
```

Or from the repo root, double-click `START-SCRAPER-API.bat` (Windows).

## Hetzner VPS Deployment

```bash
# On the VPS
git clone <your-repo> scraper-api
cd scraper-api
npm install --production

# Copy env template and set API_KEY + site URLs
cp .env.example .env
nano .env

# Create log directory
mkdir -p logs

# Start with PM2
npm run pm2:start
pm2 save
pm2 startup
```

### Nginx reverse proxy (optional)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `API_KEY` | _(unset)_ | Secret key for `X-Api-Key` / `Bearer` auth (required in production) |
| `CORS_ORIGIN` | _(unset)_ | Allowed origin for CORS (`*` or your app URL) |
| `RATE_LIMIT_MAX` | `120` | Max API requests per minute per IP |
| `WATCH_RATE_LIMIT_MAX` | `30` | Max `/api/watch` requests per minute per IP |
| `CACHE_TTL` | `28800` | List/section cache TTL in seconds |
| `WATCH_CACHE_TTL` | `180` | Watch endpoint cache TTL in seconds |
| `REQUEST_TIMEOUT` | `30000` | HTTP timeout (ms) |
| `ALLOWED_SCRAPE_HOSTS` | xvideos domains | Comma-separated allowed scrape hostnames |
| `HOME_BASE_URL` | xvideos.com | Website 1 base URL |
| `HOME_LIST_PATH` | `/best/2026-05` | Home list path |
| `MODELS_BASE_URL` | xvideos.com | Website 2 base URL |
| `MODELS_LIST_PATH` | `/pornstars-index` | Models list path |
| `TAGS_BASE_URL` | xvideos.com | Website 3 base URL |
| `TAGS_LIST_PATH` | `/tags` | Tags list path |
| `CHANNELS_BASE_URL` | xvideos.com | Website 4 base URL |
| `CHANNELS_LIST_PATH` | `/channels-index` | Channels list path |
| `WATCH_BASE_URL` | xvideos.com | Watch referer base URL |
| `WATCH_REFERER` | xvideos.com | Watch HTTP referer header |

## Architecture

```
Flutter App
    │
    ▼
Express Routes → Controllers
    │
    ▼
Cache Service (hit? return : scrape)
    │
    ▼
Scraper Service (config-driven)
    ├── HTML → Parser Service → Cheerio + extract-field
    └── JSON API → Parser Service → extract-video
    │
    ▼
Watch Service → mp4 / m3u8 regex extraction
```

## License

MIT
