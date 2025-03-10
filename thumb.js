const extractFrames = require("ffmpeg-extract-frames");
const fs = require("fs");

var files = fs.readdirSync("./files");

files.forEach(file => {
    if (file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".mov")) {
        extractFrames({
            input: `./files/${file}`,
            output: `./thumbnails/${file.replace(".mp4", "")}.jpg`,
            offsets: [1000]
        });
    }
});
