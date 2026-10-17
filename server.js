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

// Route Stream Downloader Proxy (Membungkus file & mengganti nama file download)
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

// Route Utama Proxy API v1 (Sembunyikan URL asli tembak API)
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
        const rawData = await tiktokDownloader(url);
        const data = rawData.data || rawData.result || rawData;

        // Masking URL menjadi endpoint proxy local
        const createProxyUrl = (targetUrl, ext) => {
            if (!targetUrl) return '';
            return `${host}/api/v1/dl?url=${encodeURIComponent(targetUrl)}&ext=${ext}`;
        };

        const formattedMedia = Array.isArray(data.media) ? data.media.map(m => ({
            type: m.type || '',
            url: createProxyUrl(m.url, 'mp4')
        })) : [];

        if (formattedMedia.length === 0) {
            if (data.nowatermark) formattedMedia.push({ type: 'nowatermark', url: createProxyUrl(data.nowatermark, 'mp4') });
            if (data.video) formattedMedia.push({ type: '', url: createProxyUrl(data.video, 'mp4') });
        }

        const formattedResponse = {
            success: true,
            title: data.title || 'Video Media',
            taken_at: data.taken_at || new Date().toLocaleString(),
            region: data.region || 'ID',
            id: data.id || generate20Digits(),
            duration: data.duration || '-',
            cover: createProxyUrl(data.cover || data.thumbnail, 'jpg'),
            media: formattedMedia,
            music_info: {
                id: data.music_info?.id || generate20Digits(),
                title: data.music_info?.title || 'Original Sound',
                author: data.music_info?.author || 'Unknown',
                url: createProxyUrl(data.music_info?.url || data.music, 'mp3')
            },
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
        };

        return res.json(formattedResponse);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal memproses data media',
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
