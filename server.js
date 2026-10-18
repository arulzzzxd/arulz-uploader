const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper Proxy URL agar gambar tidak diblokir CORS/Referer TikWM
function getProxyUrl(req, originalUrl) {
    if (!originalUrl) return '';
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    return `${protocol}://${host}/api/v1/proxy?url=${encodeURIComponent(originalUrl)}`;
}

// Route Proxy Media / Gambar dengan Auto Content-Type
app.get('/api/v1/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL media wajib diisi');

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tikwm.com/'
            },
            timeout: 10000
        });

        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Stream Error:', error.message);
        res.status(500).send('Gagal memuat berkas media.');
    }
});

// Scraper TikTok API v2 (ttdlv2) dengan Fallback Otomatis
async function tiktokDownloader(tiktokUrl, req) {
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

            const rawCover = raw.cover || '';
            const rawAvatar = raw.author?.avatar || '';

            return {
                status: true,
                data: {
                    title: raw.title || raw.caption || '',
                    taken_at: raw.taken_at || '',
                    region: raw.region || '',
                    id: raw.id || '',
                    duration: raw.duration || '',
                    cover: getProxyUrl(req, rawCover),
                    media: mediaList,
                    music_info: raw.music_info || null,
                    stats: raw.stats || null,
                    author: {
                        id: raw.author?.id || '',
                        fullname: raw.author?.fullname || '',
                        nickname: raw.author?.nickname || 'TikTok User',
                        avatar: getProxyUrl(req, rawAvatar)
                    },
                    video_tanpa_watermark: videoUrl,
                    audio_mp3: raw.music_info?.url || ''
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
            const hdPlayUrl = d.hdplay ? (d.hdplay.startsWith('http') ? d.hdplay : `https://www.tikwm.com${d.hdplay}`) : '';
            const wmPlayUrl = d.wmplay ? (d.wmplay.startsWith('http') ? d.wmplay : `https://www.tikwm.com${d.wmplay}`) : '';
            const musicUrl = d.music ? (d.music.startsWith('http') ? d.music : `https://www.tikwm.com${d.music}`) : '';
            
            const rawCoverUrl = d.cover ? (d.cover.startsWith('http') ? d.cover : `https://www.tikwm.com${d.cover}`) : '';
            const rawAvatarUrl = d.author?.avatar ? (d.author.avatar.startsWith('http') ? d.author.avatar : `https://www.tikwm.com${d.author.avatar}`) : '';

            const mediaArr = [];
            if (wmPlayUrl) mediaArr.push({ type: 'watermark', url: wmPlayUrl });
            if (playUrl) mediaArr.push({ type: 'nowatermark', url: playUrl });
            if (hdPlayUrl) mediaArr.push({ type: 'nowatermark_hd', url: hdPlayUrl });

            return {
                status: true,
                data: {
                    title: d.title || '',
                    taken_at: '',
                    region: d.region || '',
                    id: d.id || '',
                    duration: d.duration ? `${d.duration} Seconds` : '',
                    cover: getProxyUrl(req, rawCoverUrl),
                    media: mediaArr,
                    music_info: {
                        id: '',
                        title: d.music_info?.title || 'Original Sound',
                        author: d.music_info?.author || '',
                        url: musicUrl
                    },
                    stats: {
                        views: d.play_count ? d.play_count.toLocaleString('id-ID') : '0',
                        likes: d.digg_count ? d.digg_count.toLocaleString('id-ID') : '0',
                        comment: d.comment_count ? d.comment_count.toLocaleString('id-ID') : '0',
                        share: d.share_count ? d.share_count.toLocaleString('id-ID') : '0',
                        download: d.download_count ? d.download_count.toLocaleString('id-ID') : '0'
                    },
                    author: {
                        id: d.author?.id || '',
                        fullname: d.author?.unique_id || '',
                        nickname: d.author?.nickname || 'TikTok User',
                        avatar: getProxyUrl(req, rawAvatarUrl)
                    },
                    video_tanpa_watermark: hdPlayUrl || playUrl || wmPlayUrl,
                    audio_mp3: musicUrl
                }
            };
        }
    } catch (fallbackError) {
        console.error('API Cadangan TikWM juga gagal:', fallbackError.message);
    }

    throw new Error('Gagal terhubung ke semua API TikTok. Silakan pastikan tautan valid.');
}

// Scraper Pinterest API (pinterestdl)
async function pinterestDownloader(pinterestUrl, req) {
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
            const rawData = await pinterestDownloader(url, req);
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
                    title: displayTitle,
                    author: {
                        nickname: user.fullName || user.username || 'Pinterest Creator',
                        avatar: ''
                    },
                    cover: getProxyUrl(req, coverUrl),
                    media: formattedMedia
                }
            });
        } else {
            // Handler TikTok
            const rawData = await tiktokDownloader(url, req);

            if (!rawData || !rawData.status || !rawData.data) {
                return res.status(400).json({
                    status: false,
                    message: 'Gagal memproses video TikTok. Pastikan tautan valid.'
                });
            }

            return res.json({
                status: true,
                platform: 'TIKTOK',
                data: rawData.data
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
