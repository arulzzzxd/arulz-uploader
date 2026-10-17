const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper pembuat 20 angka acak
function generate20Digits() {
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

// Scraper TikTok API
async function tiktokDownloader(tiktokUrl) {
    const apiUrl = 'https://api.arulzzxd.my.id/api/download/ttdlv2';
    try {
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
        throw error;
    }
}

// Scraper Pinterest API
async function pinterestDownloader(pinterestUrl) {
    const apiUrl = 'https://api.arulzzxd.my.id/api/download/pinterestdl';
    try {
        const response = await axios.get(apiUrl, {
            params: {
                url: pinterestUrl,
                apikey: 'haqqiarulz'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Route Stream Downloader Proxy
app.get('/api/v1/dl', async (req, res) => {
    const { url, ext = 'mp4' } = req.query;
    if (!url) return res.status(400).send('Parameter URL wajib diisi');

    try {
        const decodedUrl = decodeURIComponent(url);
        const fileName = `ArulXd-${generate20Digits()}.${ext}`;

        const response = await axios({
            method: 'get',
            url: decodedUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        response.data.pipe(res);
    } catch (err) {
        res.status(500).send('Gagal mengunduh berkas media');
    }
});

// Route Utama Proxy API v1
app.get('/api/v1/download', async (req, res) => {
    const { url } = req.query;
    const host = `${req.protocol}://${req.get('host')}`;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            message: 'Parameter URL media wajib diisi' 
        });
    }

    try {
        const createProxyUrl = (targetUrl, ext) => {
            if (!targetUrl) return '';
            return `${host}/api/v1/dl?url=${encodeURIComponent(targetUrl)}&ext=${ext}`;
        };

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

            // Memproses Video jika ada
            if (Array.isArray(content.videos) && content.videos.length > 0) {
                content.videos.forEach(v => {
                    if (v.url) {
                        formattedMedia.push({
                            type: v.quality ? `VIDEO (${v.quality.toUpperCase()})` : 'DOWNLOAD VIDEO MP4',
                            url: createProxyUrl(v.url, 'mp4')
                        });
                    }
                });
            }

            // Memproses Gambar (Urutkan kualitas: Original, 736x, 564x, 474x)
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

                        const ext = img.url.includes('.png') ? 'png' : 'jpg';
                        formattedMedia.push({
                            type: label,
                            url: createProxyUrl(img.url, ext)
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
                cover: createProxyUrl(coverUrl, 'jpg'),
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
                    avatar: createProxyUrl(coverUrl, 'jpg')
                }
            });
        } else {
            // TikTok Scraper Handler
            const rawData = await tiktokDownloader(url);
            const data = rawData.data || rawData.result || rawData;

            const formattedMedia = Array.isArray(data.media) ? data.media.map(m => {
                let label = m.type || '';
                if (m.type === 'nowatermark') label = 'NO WATERMARK MP4';
                else if (m.type === 'nowatermark_hd') label = 'NO WATERMARK HD MP4';
                else if (m.type === 'watermark' || m.type === '') label = 'WATERMARK MP4';

                return {
                    type: label,
                    url: createProxyUrl(m.url, 'mp4')
                };
            }) : [];

            if (formattedMedia.length === 0) {
                if (data.nowatermark) formattedMedia.push({ type: 'NO WATERMARK MP4', url: createProxyUrl(data.nowatermark, 'mp4') });
                if (data.video) formattedMedia.push({ type: 'WATERMARK MP4', url: createProxyUrl(data.video, 'mp4') });
            }

            return res.json({
                success: true,
                platform: 'TIKTOK',
                title: data.title || 'Video TikTok',
                taken_at: data.taken_at || new Date().toLocaleString(),
                region: data.region || 'ID',
                id: data.id || generate20Digits(),
                duration: data.duration || '-',
                cover: createProxyUrl(data.cover || data.thumbnail, 'jpg'),
                media: formattedMedia,
                music_info: (data.music_info || data.music) ? {
                    id: data.music_info?.id || generate20Digits(),
                    title: data.music_info?.title || 'Original Sound',
                    author: data.music_info?.author || 'Unknown',
                    url: createProxyUrl(data.music_info?.url || data.music, 'mp3')
                } : null,
                stats: data.stats || {
                    views: '0',
                    likes: '0',
                    comment: '0',
                    share: '0',
                    download: '0'
                },
                author: {
                    fullname: data.author?.fullname || 'user',
                    nickname: data.author?.nickname || 'Creator',
                    avatar: createProxyUrl(data.author?.avatar, 'jpg')
                }
            });
        }
    } catch (error) {
        console.error('Error Proxy:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal memproses media. Pastikan tautan valid dan publik.',
            error: error.message 
        });
    }
});

// Fallback Proxy
app.get('/api/download', (req, res) => {
    res.redirect(`/api/v1/download?url=${encodeURIComponent(req.query.url || '')}`);
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/documentation', (req, res) => res.sendFile(path.join(__dirname, 'documentation.html')));

app.listen(PORT, () => {
    console.log(`Server ARULZXD berjalan di http://localhost:${PORT}`);
});
