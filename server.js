const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function generate20Digits() {
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

// Scraper TikTok API v2 (ttdlv2) dengan Fallback Otomatis
async function tiktokDownloader(tiktokUrl) {
    const primaryUrl = 'https://api.arulzzxd.my.id/api/download/ttdlv2';
    
    // 1. Coba API Utama (ttdlv2)
    try {
        const response = await axios.get(primaryUrl, {
            params: {
                url: tiktokUrl,
                apikey: 'haqqiarulz'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const raw = response.data;

        if (raw && (raw.success || raw.status)) {
            const mediaList = raw.media || [];
            const noWmHd = mediaList.find(m => m.type === 'nowatermark_hd');
            const noWm = mediaList.find(m => m.type === 'nowatermark');
            const wm = mediaList.find(m => m.type === 'watermark');

            const videoUrl = noWmHd?.url || noWm?.url || wm?.url || '';

            return {
                status: true,
                data: {
                    video_tanpa_watermark: videoUrl,
                    audio_mp3: raw.music_info?.url || '',
                    caption: raw.title || raw.caption || '',
                    author: raw.author ? (raw.author.nickname || raw.author.fullname || raw.author) : 'TikTok User',
                    cover: raw.cover || '',
                    media: mediaList
                }
            };
        }
    } catch (error) {
        console.warn('API Utama TikTok (ttdlv2) bermasalah, mengalihkan ke API cadangan (TikWM)...');
    }

    // 2. Fallback ke TikWM API jika API Utama gagal
    try {
        const tikwmRes = await axios.post(
            'https://www.tikwm.com/api/',
            new URLSearchParams({ url: tiktokUrl, hd: '1' }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 12000
            }
        );

        const resData = tikwmRes.data;
        if (resData && resData.code === 0 && resData.data) {
            const d = resData.data;
            const playUrl = d.play ? (d.play.startsWith('http') ? d.play : `https://www.tikwm.com${d.play}`) : '';
            const musicUrl = d.music ? (d.music.startsWith('http') ? d.music : `https://www.tikwm.com${d.music}`) : '';
            const coverUrl = d.cover ? (d.cover.startsWith('http') ? d.cover : `https://www.tikwm.com${d.cover}`) : '';

            return {
                status: true,
                data: {
                    video_tanpa_watermark: playUrl,
                    audio_mp3: musicUrl,
                    caption: d.title || '',
                    author: d.author?.nickname || d.author?.unique_id || 'TikTok User',
                    cover: coverUrl,
                    media: []
                }
            };
        }
    } catch (fallbackError) {
        console.error('API Cadangan TikWM juga gagal:', fallbackError.message);
    }

    throw new Error('Gagal terhubung ke semua API TikTok. Silakan pastikan tautan valid.');
}

// Scraper Pinterest API (pinterestdl)
async function pinterestDownloader(pinterestUrl) {
    const apiUrl = 'https://api.arulzzxd.my.id/api/download/pinterestdl';
    try {
        const response = await axios.get(apiUrl, {
            params: {
                url: pinterestUrl,
                apikey: 'haqqiarulz'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal terhubung ke API Pinterest.');
    }
}

// Route Utama Extractor API v1
app.get('/api/v1/download', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ 
            status: false, 
            message: 'Parameter URL media wajib diisi' 
        });
    }

    try {
        const isPinterest = /pinterest\.com|pin\.it/i.test(url);

        if (isPinterest) {
            const rawData = await pinterestDownloader(url);
            const resObj = rawData.result || rawData.data || rawData;

            if (!resObj) {
                return res.status(400).json({
                    status: false,
                    message: 'Gagal mengekstrak data dari Pinterest.'
                });
            }

            const post = resObj.post || {};
            const user = resObj.user || {};
            const content = resObj.content || {};

            const formattedMedia = [];

            if (Array.isArray(content.videos) && content.videos.length > 0) {
                content.videos.forEach(v => {
                    if (v.url) {
                        formattedMedia.push({
                            type: v.quality ? `VIDEO (${v.quality.toUpperCase()})` : 'DOWNLOAD VIDEO MP4',
                            url: v.url
                        });
                    }
                });
            }

            if (Array.isArray(content.images) && content.images.length > 0) {
                const priorityOrder = ['orig', '736x', '564x', '474x', '236x'];
                const sortedImages = [...content.images].sort((a, b) => {
                    const idxA = priorityOrder.indexOf(a.quality);
                    const idxB = priorityOrder.indexOf(b.quality);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return 0;
                });

                const seenUrls = new Set();
                sortedImages.forEach(img => {
                    if (img.url && !seenUrls.has(img.url)) {
                        seenUrls.add(img.url);
                        let label = `GAMBAR (${img.quality ? img.quality.toUpperCase() : 'HD'})`;
                        if (img.quality === 'orig') label = 'GAMBAR ORIGINAL (HD MAX)';

                        formattedMedia.push({
                            type: label,
                            url: img.url
                        });
                    }
                });
            }

            const origImg = content.images ? content.images.find(i => i.quality === 'orig') : null;
            const coverUrl = origImg ? origImg.url : (content.images && content.images[0] ? content.images[0].url : '');

            let displayTitle = post.title;
            if (!displayTitle || displayTitle === '(no title)') {
                displayTitle = post.description || 'Pinterest Media Pin';
            }

            return res.json({
                status: true,
                platform: 'PINTEREST',
                data: {
                    caption: displayTitle,
                    author: user.fullName || user.username || 'Pinterest Creator',
                    cover: coverUrl,
                    media: formattedMedia
                }
            });
        } else {
            // Handler TikTok
            const rawData = await tiktokDownloader(url);

            if (!rawData || !rawData.status || !rawData.data) {
                return res.status(400).json({
                    status: false,
                    message: 'Gagal memproses video TikTok. Pastikan tautan valid.'
                });
            }

            return res.json({
                status: true,
                platform: 'TIKTOK',
                data: {
                    video_tanpa_watermark: rawData.data.video_tanpa_watermark || '',
                    audio_mp3: rawData.data.audio_mp3 || '',
                    caption: rawData.data.caption || '',
                    author: rawData.data.author || '',
                    cover: rawData.data.cover || '',
                    media: rawData.data.media || []
                }
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            status: false, 
            message: error.message || 'Gagal memproses media.',
        });
    }
});

app.get('/api/download', (req, res) => {
    res.redirect(`/api/v1/download?url=${encodeURIComponent(req.query.url || '')}`);
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/documentation', (req, res) => res.sendFile(path.join(__dirname, 'documentation.html')));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server ARULZXD berjalan di http://localhost:${PORT}`));
}

module.exports = app;
