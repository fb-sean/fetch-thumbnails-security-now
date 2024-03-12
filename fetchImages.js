const axios = require('axios');
const fs = require('fs');

(async () => {
    let images = require('./data/videos.json');
    for(const image of images) {
        let error = null;
        let response = await axios.get(image.thumbnail, {
            responseType: 'arraybuffer'
        }).catch((error) => {
            error = true;
        });

        if(error) {
            error = null;
            response = await axios.get(image.thumbnail.replace('maxresdefault', 'sddefault'), {
                responseType: 'arraybuffer'
            }).catch((error) => {
                error = true;
            });

            if(error) {
                error = null;
                response = await axios.get(image.thumbnail.replace('maxresdefault', 'hqdefault'), {
                    responseType: 'arraybuffer'
                }).catch((error) => {
                    error = true;
                });
            }
        }

        if (!response) {
            console.error('Error fetching image:', image.title);
            continue;
        }

        fs.writeFileSync(`./data/imgs/${encodeURIComponent(image.title)}.jpg`, response.data);

        console.log(`Fetched ${image.title}`);
    }
})();
