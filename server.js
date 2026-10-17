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

// Scraper TikTok API (ttdlv2)
async function tiktokDownloader(tiktokUrl) {
    const apiUrl = 'https://api.arulzzxd.my.id/api/download/ttdlv2';
    try {
        const response = await axios.get(apiUrl, {
            params: {
                url: tiktokUrl,
                apikey: 'haqqiarulz'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gagal terhubung ke API TikTok.');
    }
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
            success: false, 
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
                    success: false,
                    message: 'Gagal mengekstrak data dari Pinterest.'
                });
            }

            const post = resObj.post || {};
            const user = resObj.user || {};
            const content = resObj.content || {};

            const formattedMedia = [];

            // Memproses Video
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

            // Memproses Gambar (Prioritas Original -> Resolution)
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
                success: true,
                platform: 'PINTEREST',
                title: displayTitle,
                taken_at: post.createdAt || new Date().toLocaleString(),
                region: 'US',
                id: generate20Digits(),
                duration: '-',
                cover: coverUrl,
                media: formattedMedia,
                stats: {
                    views: '-',
                    likes: String(post.likesCount || 0),
                    comment: String(post.commentCount || 0),
                    share: '-',
                    download: '-'
                },
                author: {
                    fullname: user.username || 'pinterest_user',
                    nickname: user.fullName || 'Pinterest Creator',
                    avatar: coverUrl
                }
            });
        } else {
            // TikTok Scraper Handler (Langsung Tanpa Proxy)
            const rawData = await tiktokDownloader(url);

            if (!rawData || (!rawData.success && !rawData.status && !rawData.media)) {
                return res.status(400).json({
                    success: false,
                    message: rawData?.message || 'Gagal memproses video TikTok. Pastikan akun tidak diprivate.'
                });
            }

            const formattedMedia = [];

            if (Array.isArray(rawData.media)) {
                rawData.media.forEach(m => {
                    let label = 'DOWNLOAD MP4';
                    if (m.type === 'nowatermark') label = 'NO WATERMARK MP4';
                    else if (m.type === 'nowatermark_hd') label = 'NO WATERMARK HD MP4';
                    else if (m.type === 'watermark') label = 'WATERMARK MP4';

                    if (m.url) {
                        formattedMedia.push({
                            type: label,
                            url: m.url
                        });
                    }
                });
            }

            return res.json({
                success: true,
                platform: 'TIKTOK',
                title: rawData.title || 'Video TikTok',
                taken_at: rawData.taken_at || new Date().toLocaleString(),
                region: rawData.region || 'ID',
                id: rawData.id || generate20Digits(),
                duration: rawData.duration || '-',
                cover: rawData.cover || '',
                media: formattedMedia,
                music_info: (rawData.music_info && rawData.music_info.url) ? {
                    id: rawData.music_info.id || generate20Digits(),
                    title: rawData.music_info.title || 'Original Sound',
                    author: rawData.music_info.author || 'Unknown',
                    url: rawData.music_info.url
                } : null,
                stats: {
                    views: String(rawData.stats?.views || '0'),
                    likes: String(rawData.stats?.likes || '0'),
                    comment: String(rawData.stats?.comment || '0'),
                    share: String(rawData.stats?.share || '0'),
                    download: String(rawData.stats?.download || '0')
                },
                author: {
                    fullname: rawData.author?.fullname || 'user',
                    nickname: rawData.author?.nickname || 'TikTok Creator',
                    avatar: rawData.author?.avatar || ''
                }
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
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
