const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Scraper TikTok Downloader VVIP
async function tiktokDownloader(tiktokUrl) {
    const apiUrl = 'https://api.arulzzxd.my.id/api/download/ttdlv2';
    
    try {
        console.log('Sedang mengambil data video TikTok...');
        const response = await axios.get(apiUrl, {
            params: {
                url: tiktokUrl,
                apikey: 'haqqiarulz'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error saat scraping TikTok Downloader:', error.message);
        throw error;
    }
}

// Route API v1 Proxy Endpoint
app.get('/api/v1/download', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            message: 'Parameter URL media wajib diisi' 
        });
    }

    try {
        const result = await tiktokDownloader(url);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data dari server API',
            error: error.message 
        });
    }
});

// Fallback Proxy untuk kompatibilitas
app.get('/api/download', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL wajib diisi' });
    try {
        const result = await tiktokDownloader(url);
        return res.json({ status: true, data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Halaman Utama UI (Tanpa Folder Public)
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARULZXD Downloader - Universal Media Downloader</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-canvas: #FAF8F5;
            --card-bg: #FFFFFF;
            --brand-yellow: #FFE600;
            --brand-cyan: #A3E635;
            --brand-pink: #FF90E8;
            --brand-blue: #7DD3FC;
            --text-dark: #0D0D0D;
            --border-thick: #0D0D0D;
            --shadow-hard: 4px 4px 0px #0D0D0D;
            --shadow-hard-lg: 6px 6px 0px #0D0D0D;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background-color: var(--bg-canvas); color: var(--text-dark); padding: 24px 16px 48px 16px; max-width: 480px; margin: 0 auto; min-height: 100vh; }
        
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .brand-box { display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; }
        .brand-icon { width: 42px; height: 42px; background-color: var(--brand-yellow); border: 2.5px solid var(--border-thick); border-radius: 10px; box-shadow: 3px 3px 0px var(--border-thick); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; font-family: 'Space Grotesk', sans-serif; }
        .brand-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; line-height: 1.1; letter-spacing: -0.5px; }
        .brand-title span { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 12px; color: #666; letter-spacing: 0; }
        
        .header-nav { display: flex; gap: 8px; }
        .nav-btn { width: 42px; height: 42px; background: var(--card-bg); border: 2.5px solid var(--border-thick); border-radius: 10px; box-shadow: 3px 3px 0px var(--border-thick); cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none; color: inherit; }
        .nav-btn svg { width: 20px; height: 20px; stroke: var(--text-dark); stroke-width: 2.2; fill: none; }
        
        .hero { text-align: center; margin-bottom: 28px; }
        .hero-badge { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; background: #E5E7EB; border: 2px solid var(--border-thick); padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; box-shadow: 2px 2px 0px var(--border-thick); }
        .hero-headline { font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 800; line-height: 1.15; margin-bottom: 10px; text-transform: uppercase; }
        .highlight { background-color: var(--brand-yellow); padding: 0 8px; border: 2px solid var(--border-thick); border-radius: 6px; display: inline-block; box-shadow: 2px 2px 0px var(--border-thick); }
        .hero-subtext { font-size: 13.5px; color: #4B5563; font-weight: 600; line-height: 1.5; padding: 0 12px; }

        .input-group { position: relative; margin-bottom: 14px; }
        .url-input { width: 100%; padding: 16px; padding-right: 115px; font-size: 13.5px; font-weight: 700; border: 2.5px solid var(--border-thick); border-radius: 12px; background-color: var(--card-bg); box-shadow: var(--shadow-hard); outline: none; }
        .btn-paste { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #FFFFFF; border: 2px solid var(--border-thick); border-radius: 8px; padding: 8px 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 2px 2px 0px var(--border-thick); }
        .btn-paste svg { width: 14px; height: 14px; stroke: var(--text-dark); stroke-width: 2.2; fill: none; }

        .btn-submit { width: 100%; padding: 16px; background-color: #E5E7EB; color: #9CA3AF; border: 2.5px solid var(--border-thick); border-radius: 12px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; cursor: not-allowed; box-shadow: var(--shadow-hard); display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 28px; transition: all 0.15s ease; }
        .btn-submit.active { background-color: var(--brand-yellow); color: var(--text-dark); cursor: pointer; }
        .btn-submit svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 2.5; fill: none; }

        .section-tag { display: inline-flex; align-items: center; gap: 6px; background-color: var(--brand-cyan); border: 2px solid var(--border-thick); padding: 5px 12px; font-size: 11px; font-weight: 800; border-radius: 6px; box-shadow: 2px 2px 0px var(--border-thick); margin-bottom: 16px; letter-spacing: 0.5px; text-transform: uppercase; }
        #result-box { display: none; background: var(--card-bg); border: 2.5px solid var(--border-thick); border-radius: 14px; padding: 16px; box-shadow: var(--shadow-hard-lg); margin-bottom: 28px; }
        .author-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .author-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border-thick); object-fit: cover; }
        .author-name { font-size: 13px; font-weight: 800; line-height: 1.2; }
        .author-username { font-size: 11px; color: #6B7280; font-weight: 600; }
        .media-preview-container { width: 100%; border-radius: 10px; border: 2px solid var(--border-thick); overflow: hidden; background: #000; margin-bottom: 12px; max-height: 280px; display: flex; align-items: center; justify-content: center; }
        .media-preview-container img { width: 100%; height: 100%; object-fit: cover; }
        .media-title { font-size: 13.5px; font-weight: 700; margin-bottom: 14px; line-height: 1.4; color: var(--text-dark); }
        .stats-bar { display: flex; justify-content: space-between; background: var(--bg-canvas); border: 2px solid var(--border-thick); border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; font-weight: 800; }

        .download-actions { display: flex; flex-direction: column; gap: 10px; }
        .dl-btn { display: flex; align-items: center; justify-content: flex-start; gap: 12px; width: 100%; padding: 12px 16px; border: 2.5px solid var(--border-thick); border-radius: 10px; font-weight: 800; font-size: 12.5px; color: var(--text-dark); text-decoration: none; box-shadow: 3px 3px 0px var(--border-thick); }
        .dl-btn.wm { background: var(--brand-blue); }
        .dl-btn.nowm { background: var(--brand-yellow); }
        .dl-btn.hd { background: var(--brand-cyan); }
        .dl-btn.mp3 { background: var(--brand-pink); }
        .dl-btn svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 2.2; fill: none; flex-shrink: 0; }

        .platform-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .platform-card { background: var(--card-bg); border: 2.5px solid var(--border-thick); border-radius: 12px; padding: 14px; box-shadow: var(--shadow-hard); display: flex; flex-direction: column; gap: 8px; }
        .card-header { display: flex; align-items: center; gap: 10px; }
        .icon-wrapper { width: 32px; height: 32px; border-radius: 8px; border: 2px solid var(--border-thick); background-color: var(--bg-canvas); display: flex; align-items: center; justify-content: center; }
        .icon-wrapper svg { width: 18px; height: 18px; fill: currentColor; }
        .card-name { font-size: 12px; font-weight: 800; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; }
        .card-desc { font-size: 11px; color: #6B7280; font-weight: 600; line-height: 1.35; }
    </style>
</head>
<body>
    <header>
        <a href="#" class="brand-box">
            <div class="brand-icon">AXD</div>
            <div class="brand-title">ARULZXD <span>downloader</span></div>
        </a>
        <div class="header-nav">
            <a href="/documentation" class="nav-btn" title="Dokumentasi API">
                <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </a>
        </div>
    </header>

    <section class="hero">
        <div class="hero-badge">ARULZXD CLOUD SYSTEM</div>
        <h1 class="hero-headline">SATU TAUTAN.<br><span class="highlight">SEMUA PLATFORM.</span></h1>
        <p class="hero-subtext">Tempelkan tautan media sosial. Sistem mendeteksi platform dan menampilkan hasil secara otomatis.</p>
    </section>

    <div class="input-group">
        <input type="url" id="media-url" class="url-input" placeholder="Tempelkan URL video TikTok di sini..." autocomplete="off">
        <button class="btn-paste" onclick="pasteClipboard()">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            TEMPEL
        </button>
    </div>

    <button id="btn-process" class="btn-submit" onclick="executeDownload()">
        <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        <span>PROSES SEKARANG</span>
    </button>

    <div id="preview-section">
        <div id="result-box">
            <div class="section-tag">
                <span>PRATINJAU HASIL</span>
            </div>
            <div id="author-container" class="author-info"></div>
            <div class="media-preview-container">
                <img id="res-thumb" src="" alt="Thumbnail Video">
            </div>
            <div id="res-title" class="media-title"></div>
            <div id="res-stats" class="stats-bar"></div>
            <div class="download-actions" id="res-actions"></div>
        </div>
    </div>

    <div class="platform-grid">
        <div class="platform-card">
            <div class="card-header">
                <div class="icon-wrapper">
                    <svg viewBox="0 0 24 24"><path d="M12.525.001c1.31 0 2.61.115 3.841.348V5.01a8.03 8.03 0 01-2.221-.302c-1.127-.302-1.93-.972-1.93-2.203V0h.31zm3.84 5.358c1.378 1.042 2.923 1.706 4.635 1.832v4.205a11.96 11.96 0 01-4.635-1.042v6.62c0 4.135-3.353 7.488-7.488 7.488S1.389 21.147 1.389 17.012c0-4.135 3.354-7.488 7.489-7.488.463 0 .915.042 1.354.125V14.1a3.292 3.292 0 00-1.354-.286c-1.815 0-3.287 1.472-3.287 3.287 0 1.815 1.472 3.287 3.287 3.287 1.815 0 3.287-1.472 3.287-3.287V.001h4.202v5.358z"/></svg>
                </div>
                <div class="card-name">TIKTOK</div>
            </div>
            <div class="card-desc">Video tanpa watermark, kualitas HD & slideshow foto.</div>
        </div>

        <div class="platform-card">
            <div class="card-header">
                <div class="icon-wrapper">
                    <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <div class="card-name">YOUTUBE</div>
            </div>
            <div class="card-desc">Shorts, resolusi hingga 1080p, serta ekstraksi MP3.</div>
        </div>

        <div class="platform-card">
            <div class="card-header">
                <div class="icon-wrapper">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <div class="card-name">INSTAGRAM</div>
            </div>
            <div class="card-desc">Unduh Reels, Postingan Video, dan Slideshow.</div>
        </div>

        <div class="platform-card">
            <div class="card-header">
                <div class="icon-wrapper">
                    <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                </div>
                <div class="card-name">PINTEREST</div>
            </div>
            <div class="card-desc">Simpan media pin gambar dan video berkualitas.</div>
        </div>
    </div>

    <script>
        const inputUrl = document.getElementById('media-url');
        const btnProcess = document.getElementById('btn-process');

        inputUrl.addEventListener('input', () => {
            if (inputUrl.value.trim() !== '') {
                btnProcess.classList.add('active');
            } else {
                btnProcess.classList.remove('active');
            }
        });

        async function pasteClipboard() {
            try {
                const text = await navigator.clipboard.readText();
                inputUrl.value = text;
                if (text.trim() !== '') btnProcess.classList.add('active');
            } catch (err) {
                alert('Gagal membaca clipboard. Tempelkan URL secara manual.');
            }
        }

        async function executeDownload() {
            const url = inputUrl.value.trim();
            if (!url) {
                alert('Masukkan URL media terlebih dahulu');
                return;
            }

            const resultBox = document.getElementById('result-box');
            const authorContainer = document.getElementById('author-container');
            const resThumb = document.getElementById('res-thumb');
            const resTitle = document.getElementById('res-title');
            const resStats = document.getElementById('res-stats');
            const resActions = document.getElementById('res-actions');

            btnProcess.innerHTML = \`
                <svg viewBox="0 0 24 24" style="animation: spin 1s linear infinite; width:18px; height:18px;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span>MEMPROSES DATA...</span>
            \`;
            btnProcess.disabled = true;

            try {
                const response = await fetch(\`/api/v1/download?url=\${encodeURIComponent(url)}\`);
                const data = await response.json();

                if (data.success || data.result) {
                    const result = data.data || data;

                    if (result.author) {
                        authorContainer.innerHTML = \`
                            <img class="author-avatar" src="\${result.author.avatar}" alt="\${result.author.nickname}">
                            <div>
                                <div class="author-name">\${result.author.nickname || ''}</div>
                                <div class="author-username">@\${result.author.fullname || ''}</div>
                            </div>
                        \`;
                    }

                    resThumb.src = result.cover || '';
                    resTitle.innerText = result.title || 'Video TikTok';

                    if (result.stats) {
                        resStats.innerHTML = \`
                            <span>VIEWS: \${result.stats.views || '0'}</span>
                            <span>LIKES: \${result.stats.likes || '0'}</span>
                            <span>DURATION: \${result.duration || '-'}</span>
                        \`;
                    }

                    resActions.innerHTML = '';

                    if (Array.isArray(result.media)) {
                        result.media.forEach(item => {
                            if (item.type === '') {
                                resActions.innerHTML += \`
                                    <a href="\${item.url}" target="_blank" class="dl-btn wm">
                                        <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 002-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                        <span>WATERMARK MP4</span>
                                    </a>
                                \`;
                            } else if (item.type === 'nowatermark') {
                                resActions.innerHTML += \`
                                    <a href="\${item.url}" target="_blank" class="dl-btn nowm">
                                        <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        <span>NOWATERMARK MP4</span>
                                    </a>
                                \`;
                            } else if (item.type === 'nowatermark_hd') {
                                resActions.innerHTML += \`
                                    <a href="\${item.url}" target="_blank" class="dl-btn hd">
                                        <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                                        <span>NOWATERMARK HD MP4</span>
                                    </a>
                                \`;
                            }
                        });
                    }

                    if (result.music_info && result.music_info.url) {
                        resActions.innerHTML += \`
                            <a href="\${result.music_info.url}" target="_blank" class="dl-btn mp3">
                                <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                                <span>MP3 AUDIO</span>
                            </a>
                        \`;
                    }

                    resultBox.style.display = 'block';
                } else {
                    alert('Gagal mengambil data video. Pastikan tautan TikTok valid.');
                }
            } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan saat memproses permintaan.');
            } finally {
                btnProcess.innerHTML = \`
                    <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span>PROSES SEKARANG</span>
                \`;
                btnProcess.disabled = false;
            }
        }
    </script>
    <style>
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</body>
</html>`);
});

// Halaman Dokumentasi API (Tanpa Folder Public)
app.get('/documentation', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARULZXD CLOUD - Dokumentasi API Universal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        mono: ['Fira Code', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #F8FAFC; color: #0F172A; }
        .code-box { background-color: #0F172A; color: #38BDF8; border: 1px solid #1E293B; border-radius: 12px; font-family: 'Fira Code', monospace; }
    </style>
</head>
<body class="min-h-screen pb-20">
    <div id="toast" class="fixed bottom-5 right-5 z-50 hidden bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
        <span>Teks berhasil disalin!</span>
    </div>

    <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="/" class="flex items-center gap-2.5 text-decoration-none">
                    <div class="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-sm border-2 border-slate-900">
                        AXD
                    </div>
                    <span class="font-extrabold text-lg tracking-tight text-slate-900">ARULZXD <span class="text-sky-600">CLOUD</span></span>
                </a>
            </div>

            <div class="flex items-center gap-3">
                <div class="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                    <span>ID</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <a href="/" class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>PUBLIC / FREE</span>
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 mt-8 flex flex-col gap-6">
        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <p class="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                API ARULZXD Cloud menggunakan arsitektur RESTful. Semua data dikirimkan dalam format JSON, dan semua respon dari server juga akan dibungkus dalam format JSON dengan status sukses atau gagal.
            </p>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">BASE URL</div>
                <div id="base-url-display" class="font-mono text-sm sm:text-base font-bold text-slate-900 break-all">
                    https://domainnya.com/api/v1
                </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div class="text-[11px] font-bold tracking-wider text-rose-500 uppercase mb-2">2 HEADER WAJIB</div>
                <ol class="font-mono text-xs sm:text-sm text-sky-600 font-semibold space-y-1.5">
                    <li>1. Accept: <span class="text-slate-800">application/json</span></li>
                    <li>2. Content-Type: <span class="text-slate-800">application/json</span></li>
                </ol>
            </div>
        </section>

        <section class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-6">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Endpoint API / Metode Integrasi:</label>
                
                <div class="relative w-full sm:w-80">
                    <select id="endpoint-select" onchange="changeEndpoint()" class="w-full bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm rounded-xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="universal">Endpoint Universal (/download)</option>
                        <option value="web">Integrasi Website (JavaScript Fetch)</option>
                        <option value="bot">Integrasi Bot (Node.js / Axios)</option>
                        <option value="apk">Integrasi Aplikasi Mobile (Flutter / Dart)</option>
                    </select>
                    <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                </div>
            </div>

            <div id="dynamic-content"></div>
        </section>
    </main>

    <script>
        const currentOrigin = (window.location.origin && window.location.origin !== 'null') 
            ? window.location.origin 
            : 'https://domainnya.com';
        
        const baseUrl = \`\${currentOrigin}/api/v1\`;
        document.getElementById('base-url-display').innerText = baseUrl;

        const endpointData = {
            universal: {
                title: "Endpoint Downloader TikTok / Universal Media",
                desc: "Mendapatkan data lengkap media TikTok seperti tautan video Watermark, No Watermark, No Watermark HD, serta file audio MP3.",
                method: "GET",
                path: "/download?url={URL_TIKTOK_MEDIA}",
                headers: ["Accept: application/json", "Content-Type: application/json"],
                response: \`{\n  "success": true,\n  "title": "aww #cosplay #angelamlbb",\n  "taken_at": "Thursday, September 10, 2026 at 12:41:02 PM",\n  "region": "ID",\n  "id": "7683885713649323271",\n  "duration": "11 Seconds",\n  "cover": "https://www.tikwm.com/video/cover/7683885713649323271.webp",\n  "media": [\n    {\n      "type": "",\n      "url": "https://www.tikwm.com/video/media/wmplay/7683885713649323271.mp4"\n    },\n    {\n      "type": "nowatermark",\n      "url": "https://www.tikwm.com/video/media/play/7683885713649323271.mp4"\n    },\n    {\n      "type": "nowatermark_hd",\n      "url": "https://www.tikwm.com/video/media/hdplay/7683885713649323271.mp4"\n    }\n  ],\n  "music_info": {\n    "id": "6859309179304217345",\n    "title": "original sound - iks1999",\n    "author": "Andy1999",\n    "url": "https://www.tikwm.com/video/music/7683885713649323271.mp3"\n  },\n  "stats": {\n    "views": "35.262",\n    "likes": "974",\n    "comment": "12",\n    "share": "136",\n    "download": "4"\n  },\n  "author": {\n    "fullname": "neng.04",\n    "nickname": "Angela",\n    "avatar": "https://www.tikwm.com/video/avatar/7683885713649323271.jpeg"\n  }\n}\`,
                exampleTitle: "CONTOH REQUEST (cURL)",
                code: \`curl -X GET "\${baseUrl}/download?url=https://vt.tiktok.com/ZS123456/" \\\n  -H "Accept: application/json"\`
            },
            web: {
                title: "Integrasi Website Frontend (JavaScript)",
                desc: "Gunakan Fetch API pada frontend aplikasi web Anda untuk mengeksekusi request ke server proxy.",
                method: "GET",
                path: "/download?url={MEDIA_URL}",
                headers: ["Accept: application/json", "Content-Type: application/json"],
                response: \`{\n  "success": true,\n  "title": "Pratinjau Video Web",\n  "media": [\n    { "type": "nowatermark", "url": "https://domain.com/video.mp4" }\n  ]\n}\`,
                exampleTitle: "KODE JAVASCRIPT (FETCH API)",
                code: \`async function fetchMediaData(mediaUrl) {\n    const endpoint = \\\`\${baseUrl}/download?url=\${encodeURIComponent(mediaUrl)}\\\`;\n    \n    try {\n        const response = await fetch(endpoint, {\n            method: 'GET',\n            headers: {\n                'Accept': 'application/json',\n                'Content-Type': 'application/json'\n            }\n        });\n        \n        const result = await response.json();\n        \n        if (result.success) {\n            console.log('Judul:', result.title);\n            console.log('Opsi Media:', result.media);\n            console.log('Audio MP3:', result.music_info.url);\n        }\n    } catch (error) {\n        console.error('Error saat memanggil API:', error);\n    }\n}\`
            },
            bot: {
                title: "Integrasi Bot (WhatsApp / Telegram - Node.js)",
                desc: "Eksekusi pemanggilan downloader dari bot WhatsApp atau Telegram menggunakan pustaka Axios.",
                method: "GET",
                path: "/download?url={MEDIA_URL}",
                headers: ["Accept: application/json"],
                response: \`{\n  "success": true,\n  "title": "Pesan Bot Media Video"\n}\`,
                exampleTitle: "KODE NODE.JS (AXIOS)",
                code: \`const axios = require('axios');\n\nasync function handleBotDownloader(mediaUrl) {\n    try {\n        const res = await axios.get(\\\`\${baseUrl}/download\\\`, {\n            params: { url: mediaUrl },\n            headers: { 'Accept': 'application/json' }\n        });\n\n        if (res.data && res.data.success) {\n            const mediaList = res.data.media;\n            const hdVideo = mediaList.find(m => m.type === 'nowatermark_hd') || mediaList.find(m => m.type === 'nowatermark');\n            \n            return {\n                title: res.data.title,\n                videoUrl: hdVideo ? hdVideo.url : null,\n                audioUrl: res.data.music_info ? res.data.music_info.url : null\n            };\n        }\n    } catch (err) {\n        console.error('Bot Request Error:', err.message);\n    }\n}\`
            },
            apk: {
                title: "Integrasi Aplikasi Mobile (APK / Flutter)",
                desc: "Pemanggilan HTTP GET Request pada aplikasi Android atau iOS menggunakan bahasa Dart (Flutter).",
                method: "GET",
                path: "/download?url={MEDIA_URL}",
                headers: ["Accept: application/json", "Content-Type: application/json"],
                response: \`{\n  "success": true,\n  "title": "Aplikasi Mobile Result"\n}\`,
                exampleTitle: "KODE FLUTTER (DART HTTP)",
                code: \`import 'dart:convert';\nimport 'package:http/http.dart' as http;\n\nFuture<void> fetchTikTokMedia(String mediaUrl) async {\n  final uri = Uri.parse('\${baseUrl}/download?url=\\\${Uri.encodeComponent(mediaUrl)}');\n  \n  final response = await http.get(uri, headers: {\n    'Accept': 'application/json',\n    'Content-Type': 'application/json',\n  });\n\n  if (response.statusCode == 200) {\n    final data = jsonDecode(response.body);\n    if (data['success'] == true) {\n      print('Judul Video: \\\${data['title']}');\n      print('Cover Thumbnail: \\\${data['cover']}');\n      print('Daftar Media: \\\${data['media']}');\n    }\n  }\n}\`
            }
        };

        function changeEndpoint() {
            const selectedKey = document.getElementById('endpoint-select').value;
            const item = endpointData[selectedKey];
            const container = document.getElementById('dynamic-content');

            container.innerHTML = \`
                <div class="flex flex-col gap-5">
                    <div>
                        <h2 class="text-xl font-extrabold text-slate-900 mb-1.5">\${item.title}</h2>
                        <p class="text-sm text-slate-600 font-medium leading-relaxed">\${item.desc}</p>
                    </div>

                    <div class="flex items-center gap-2.5 font-mono text-sm my-1">
                        <span class="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-200 text-xs tracking-wider">\${item.method}</span>
                        <span class="text-slate-800 font-semibold break-all">\${item.path}</span>
                    </div>

                    <div>
                        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">HEADERS WAJIB</div>
                        <div class="code-box p-4 text-xs sm:text-sm text-slate-100 space-y-1">
                            \${item.headers.map(h => \`<div>\${h}</div>\`).join('')}
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">\${item.exampleTitle}</div>
                            <button onclick="copyText('\${item.code.replace(/'/g, "\\\\'").replace(/\\n/g, "\\\\n")}')" class="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                                <span>Salin Kode</span>
                            </button>
                        </div>
                        <pre class="code-box p-4 text-xs sm:text-sm text-slate-100 overflow-x-auto"><code>\${escapeHtml(item.code)}</code></pre>
                    </div>

                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">RESPON SUKSES (200 OK)</span>
                        </div>
                        <pre class="code-box p-4 text-xs sm:text-sm text-emerald-400 overflow-x-auto bg-slate-900 border-slate-800"><code>\${escapeHtml(item.response)}</code></pre>
                    </div>
                </div>
            \`;
        }

        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function copyText(text) {
            navigator.clipboard.writeText(text);
            const toast = document.getElementById('toast');
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 2500);
        }

        changeEndpoint();
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log(`Server ARULZXD berjalan di http://localhost:${PORT}`);
});
