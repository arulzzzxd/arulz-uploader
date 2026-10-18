const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const API_SAVEFBS = "https://savefbs.com/api/v1/aio/html";

// Scraper Universal SaveFBS (Menggantikan Semua Scraper Lama)
async function getVideoData(videoUrl) {
    const { data: html } = await axios.post(
        API_SAVEFBS,
        {
            vid: videoUrl,
            prefix: "savefbs.com",
            ex: "",
            format: ""
        },
        {
            headers: {
                "content-type": "application/json",
                referer: "https://savefbs.com/all-in-one-video-downloader/",
                "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137 Mobile Safari/537.36"
            },
            timeout: 15000
        }
    );

    const $ = cheerio.load(html);

    // ===== BASIC INFO =====
    const title = $("h3.text-sm").text().trim() || null;
    const description =
        $(".text-gray-700").text().trim() ||
        $(".text-gray-600").text().trim() ||
        null;

    const owner =
        $("p.text-gray-600")
            .first()
            .text()
            .replace("Owner:", "")
            .trim() || null;

    const thumbnail = $("img.aio-thumbnail").attr("src") || null;

    // ===== DOWNLOAD LINKS =====
    const downloads = [];

    $("a.download-btn").each((_, el) => {
        const url = $(el).attr("href");
        const label = $(el).text().trim();

        if (url) {
            downloads.push({
                type: label,
                url
            });
        }
    });

    return {
        title,
        description,
        owner,
        thumbnail,
        downloads
    };
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
        const result = await getVideoData(url);

        if (!result || (!result.thumbnail && (!result.downloads || result.downloads.length === 0))) {
            return res.status(400).json({
                status: false,
                message: 'Gagal mengekstrak media dari URL tersebut. Pastikan tautan valid.'
            });
        }

        return res.json({
            status: true,
            platform: 'ALL-IN-ONE',
            data: {
                title: result.title || result.description || 'Media Download',
                caption: result.description || result.title || '',
                author: {
                    nickname: result.owner || 'Media Creator',
                    fullname: result.owner || '',
                    avatar: ''
                },
                cover: result.thumbnail || '',
                media: result.downloads || []
            }
        });
    } catch (error) {
        console.error('SaveFBS Scraper Error:', error.message);
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
