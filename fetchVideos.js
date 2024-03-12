const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNELID;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/';

async function getUploadsPlaylistId() {
    const response = await axios.get(`${BASE_URL}channels`, {
        params: {
            part: 'contentDetails',
            id: CHANNEL_ID,
            key: API_KEY
        }
    });
    return response.data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function fetchVideos(uploadsPlaylistId) {
    let videos = [];
    let nextPageToken = null;
    let videoDetails = []; // Array to hold details of each video

    try {
        while (videos.length < 550) {
            const response = await axios.get(`${BASE_URL}playlistItems`, {
                params: {
                    part: 'snippet',
                    playlistId: uploadsPlaylistId,
                    maxResults: 50,
                    pageToken: nextPageToken,
                    key: API_KEY
                }
            });

            const items = response.data.items;
            videos = videos.concat(items);
            nextPageToken = response.data.nextPageToken;

            items.forEach(item => {
                const videoTitle = item.snippet.title;
                const maxResThumbnailUrl = item.snippet.thumbnails.maxres ? item.snippet.thumbnails.maxres.url : 'No maxres thumbnail available';
                videoDetails.push({ title: videoTitle, thumbnail: maxResThumbnailUrl });
            });

            if (!nextPageToken) break;
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
    }

    return videoDetails;
}

async function main() {
    try {
        const uploadsPlaylistId = await getUploadsPlaylistId();
        const videos = await fetchVideos(uploadsPlaylistId);

        fs.writeFileSync('./data/videos.json', JSON.stringify(videos, null, 2));

        console.log(`Fetched ${videos.length} videos`);
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main().then(r => {});
