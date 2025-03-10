const http = require('http');
const express = require("express");
const superagent = require("superagent");
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express()
const path = require('path');
const fs = require('fs');
const virDir = path.join(__dirname, 'files');
const db = require("quick.db");
const extractFrames = require("ffmpeg-extract-frames");
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.json());

app.use("/files", express.static(path.join(__dirname, "/files/")));
app.use("/thumbnail", express.static(path.join(__dirname, "/thumbnails/")));

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './files');
    },
    filename: async function (req, file, callback) {
        var fileName = file.originalname.toLowerCase().split(' ').join('-');
        if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".mov")) {
            fs.readdir(virDir, function (err, files) {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                files.forEach(function (filnam) {
                    if (filnam === fileName) fileName = fileName.replace(`${fileName.split(".").pop()}`, `_.${fileName.split(".").pop()}`);
                });
            });

            extractFrames({
                input: `./files/${fileName}`,
                output: `./thumbnails/${fileName.replace(".mp4", "")}`,
                offsets: [1000]
            });
            db.add("latestNum", 1);
            callback(null, fileName);
            db.set(`${db.fetch("latestNum")}_fname`, fileName);
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".png") || fileName.endsWith(".gif") || fileName.endsWith(".jpeg") || fileName.endsWith(".jfif")) {
            fs.readdir(virDir, function (err, files) {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                files.forEach(function (filnam) {
                    if (filnam === fileName) fileName = fileName.replace(`${fileName.split(".").pop()}`, `_.${fileName.split(".").pop()}`);
                });
            });

            db.add("latestP", 1);
            callback(null, fileName);
            db.set(`${db.fetch("latestP")}_pname`, fileName);
        } else if (fileName.endsWith(".mp3") || fileName.endsWith(".wav") || fileName.endsWith(".flac") || fileName.endsWith(".ogg") || fileName.endsWith(".m4a")) {
            fs.readdir(virDir, function (err, files) {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                files.forEach(function (filnam) {
                    if (filnam === fileName) fileName = fileName.replace(`${fileName.split(".").pop()}`, `_.${fileName.split(".").pop()}`);
                });
            });

            db.add("latestA", 1);
            callback(null, fileName);
            db.set(`${db.fetch("latestA")}_aname`, fileName);
        }
    }
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 1000000000 }
}).single('video');

app.get('/video/latest', async function (req, res) {
    res.json({ url: `/videos?v=${db.fetch(db.fetch("latestNum") + "_fname")}` });
});

app.get('/image/latest', async function (req, res) {
    res.json({ url: `/files/${db.fetch(db.fetch("latestP") + "_pname")}` });
});

app.get('/audio/latest', async function (req, res) {
    res.json({ url: `/files/${db.fetch(db.fetch("latestA") + "_aname")}` });
});

app.get('/auto', async function (req, res) {
    let vids = db.all().filter((data) => data.ID.endsWith("video")).sort((a, b) => b.data - a.data);
    vids.length = 200;

    var i = 0;

    let list = [];

    for (i in vids) {
        let vidnam = db.fetch(`${vids[i].ID.split('_')[0]}_fname`);
        list.push(`${vidnam}`);
    }

    let result = Math.floor(Math.random() * list.length);

    let link = list[result];

    res.send(`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <meta property="og:video" content="/files/${link}" />
    <meta property="og:video:secure_url" content="/files/${link}" />
    <meta property="og:video:type" content="application/x-shockwave-flash" />
    <meta property="og:video:width" content="600" />
    <meta property="og:video:height" content="400" />
    <title>UNSAFE VIDEO HOSTING 3000 | ${link}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <style>
        body {
            width: 100%;
            height: 100%;
            max-height: 1500px;
            margin: 40px auto;
            max-width: 1500px;
            background-color: #000;
        }
    </style>
<script>
function copy() {

  var copyText = document.getElementById("linkCopy");

  copyText.select();
  copyText.setSelectionRange(0, 99999); 

  document.execCommand("copy");
  
}
document.getElementById('playerHater').addEventListener('ended', refresh, false);
function refresh(e) {
    window.location.reload();
}
</script>
</head>

<body>
    <video id="playerHater" style="width:100%;height:100%;max-width:1000px;max-height:720px;" autoplay controls>
        <source src="./files/${link}" type="video/mp4">
    </video>
    <h1 style="color:#fff;padding-left:auto;">spongebob carpetbombing moments</h1>
    <a style="font-size:28px;" href="/main">back to main</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" value="http://video.chrysa.eu/files/${link}" id="linkCopy"> <button onclick="copy()">To Clipboard</button>&nbsp;<button onclick="window.location.reload();">Random Video</button>
    <p></p>
</body>
</html>
    `);
});

app.get('/autoim', async function (req, res) {
    let pics = db.all().filter((data) => data.ID.endsWith("photo")).sort((a, b) => b.data - a.data);
    pics.length = 200;

    var i = 0;

    let list = [];

    for (i in pics) {
        let img = db.fetch(`${pics[i].ID.split('_')[0]}_pname`);
        list.push(`${img}`);
    }

    let result = Math.floor(Math.random() * list.length);

    let link = list[result];

    res.send(`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <meta property="og:image" content="/files/${link}" />
    <title>UNSAFE VIDEO HOSTING 3000 | ${link}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <style>
        body {
            width: 100%;
            height: 100%;
            max-height: 1500px;
            margin: 40px auto;
            max-width: 1500px;
            background-color: #000;
        }
    </style>
<script>
function copy() {

  var copyText = document.getElementById("linkCopy");

  copyText.select();
  copyText.setSelectionRange(0, 99999); 

  document.execCommand("copy");
  
}
</script>
</head>

<body>
   <center> 
   <br><br><br>
   <img src="./files/${link}" style="width:100%;height:100%;max-width:800px;max-height:600px;">
   <h1 style="color:#fff;padding-left:auto;"> I added a refresh button (I'm jobless)</h1>
   <a style="font-size:28px;" href="/images">back to images</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" value="http://video.chrysa.eu/files/${link}" id="linkCopy"> <button onclick="copy()">To Clipboard</button>&nbsp;<button onclick="window.location.reload();">Random Image</button>
   <p></p>
   </center>
</body>
</html>
    `);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/dioau', function (req, res) {
    res.sendFile(__dirname + "/dioau.html");
});

app.post('/comment', function (req, res) {
    // if no post data do nothing
    if (req.body.length < 1) return res.redirect(`/videos?v=${req.body.videoname}`);

    // list of stuff that could mess up the page
    let forbidden = ["<script>", "<head>", "<meta>", "color:#000", "color:black", "<iframe>", "autoplay"];

    // crap check 
    for (var i = 0; i < forbidden.length; i++) {
        if (req.body.username.includes(forbidden[i]) || req.body.comment.includes(forbidden[i])) return res.redirect(`/videos?v=${req.body.videoname}`);
    }

    let index = 0;

    while (db.fetch(`${req.body.videoname}_comment_${index}_username`) != undefined) index++;

    db.set(`${req.body.videoname}_comment_${index}_username`, req.body.username);
    db.set(`${req.body.videoname}_comment_${index}_content`, req.body.comment);

    res.redirect(`/videos?v=${req.body.videoname}`);
});

app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        if (req.body.title.length > 256 || req.body.username.length > 256) return res.redirect(`/`);

        if (err && err.toLowerCase().includes("ffmpeg")) {
            db.delete(`${db.fetch("latestNum")}_fname`);
            db.subtract("latestNum", 1);
            return res.end("Error uploading file.");
        }

        if (req.body.username.length > 0) db.set(`${db.fetch("latestNum")}_username`, req.body.username);
        db.set(`${db.fetch("latestNum")}_video`, req.body.title);
        res.end("File uploaded successfully!");
        var exec = require("child_process").exec;
        exec("node vidmsg.js", function () { });
    });
});

app.post('/imupload', function (req, res) {
    upload(req, res, function (err) {

        if (err) {
            db.delete(`${db.fetch("latestP")}_pname`);
            db.subtract("latestP", 1);
            return res.end("Error uploading file.");
        }

        if (req.body.username.length > 0) db.set(`${db.fetch("latestP")}_username`, req.body.username);
        db.set(`${db.fetch("latestP")}_photo`, req.body.title);
        res.end("File uploaded successfully!");
        var exec = require("child_process").exec;
        exec("node picmsg.js", function () { });
    });
});

app.post('/adupload', function (req, res) {
    upload(req, res, function (err) {

        if (err) {
            db.delete(`${db.fetch("latestA")}_aname`);
            db.subtract("latestA", 1);
            return res.end("Error uploading file.");
        }

        if (req.body.username.length > 0) db.set(`${db.fetch("latestA")}_username`, req.body.username);
        db.set(`${db.fetch("latestA")}_audio`, req.body.title);
        res.end("File uploaded successfully!");
        var exec = require("child_process").exec;
        exec("node audiomsg.js", function () { });
    });
});

app.use("/main", async function (req, res) {

    let vids = db.all().filter((data) => data.ID.endsWith("video")).sort((a, b) => b.data - a.data);
    let list = [];

    for (var i = vids.length - 1; i >= 0; i--) {
        let username = db.fetch(`${vids[i].ID.split('_')[0]}_username`);
        let vidnam = db.fetch(`${vids[i].ID.split('_')[0]}_fname`);
        let viewCount = db.fetch(`${vidnam}_views`);
        if (username === null) username = "anonymous";
        list.push(`<br><img id="${vids[i].ID.split('_')[0]}" src="/thumbnail/${vidnam.replace(".mp4", "")}.jpg" width="20%" height="20%">&nbsp;
        ${username}: <a href="/videos?v=${vidnam}">${vids[i].data}</a>&nbsp;&nbsp;&nbsp;<span style="font-size:1.4em">${viewCount} clicked</span>
        <br>`);
    }

    res.send(`
<!DOCTYPE html>
<html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>UNSAFE VIDEO HOSTING 3000 | criminally unsafe video streaming (how is this still up)</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <style>
        body {
            width: 100%;
            height: 100%;
            margin: 40px auto;
            max-height: 1500px;
            max-width: 1500px;
            background-color: #000;
        }
        blockquote {
            margin: 40px auto;
            max-width: 500px;
            color: #fff;
            text-align: center;
        }
    </style>
    <meta content="UNSAFE VIDEO HOSTING 3000" property="og:title" />
    <meta content="world's most unsafe video streaming website" property="og:description" />
    <meta content="/" property="og:url" />
    <meta content="https://c.tenor.com/4ZkIt5fjuwIAAAAC/detroit.gif" property="og:image" />
    <meta content="#000000" data-react-helmet="true" name="theme-color" />
</head>

<body>
<center>
    <br id="top">
    <img style="width:100%;height:100%;max-width:600px;max-height:180px;" src="./files/logo.gif">
    <br><br>

<hr style="color:white;margin: 40px auto;max-width: 500px;">
    
<a href="/">upload video</a>&nbsp;&nbsp;<a href="/img">upload image</a>&nbsp;&nbsp;<a href="/dioau">upload audio</a>&nbsp;&nbsp;<a href="#bottom">to bottom</a>
<blockquote style="text-align:left;">
<hr>
<br>
${list.join(" ")}
<br><br><hr>
</blockquote>
<a id="bottom" href="#top">to top</a>
<br><br><br>
</center>
    </body></html>
    `)
});

app.get('/img', function (req, res) {
    res.sendFile(__dirname + "/img.html");
});

app.get('/updates', function (req, res) {
    res.sendFile(__dirname + "/updates.html");
});

app.get("/embed", async function (req, res) {
    // get video name
    var name = req.query.v;

    res.send(`<iframe width="1004" height="753" src="/files/${name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
});

app.get("/videos", async function (req, res) {

    var fixd = req.originalUrl.slice(10);

    // funny comments section
    let comsection = "";

    if (db.fetch(`${fixd}_comment_0_username`) != undefined) {
        comsection += "<h3 style=\"margin-top:5%;margin-bottom:1%;\">Comments:</h3>";

        let index = 0;

        while (db.fetch(`${fixd}_comment_${index}_username`) != undefined) {
            let username = db.fetch(`${fixd}_comment_${index}_username`);
            let comment = db.fetch(`${fixd}_comment_${index}_content`);
            comsection += `<p style="font-size:150%;"><b>${username}:</b>&nbsp;${comment}</p>`;
            index++;
        }
    }

    db.add(`${fixd}_views`, 1);

    let quotes = [
        "can I have you 2022",
        "xbox live",
        "I don't know what I'm doing",
        "I make this crap for free",
        `${req.ip.replace("::ffff:", "")}`
    ];

    let result = Math.floor(Math.random() * quotes.length);

    var viewCount = db.fetch(`${fixd}_views`);

    if (viewCount === null) viewCount = 0;

    let vids = db.all().filter((data) => data.ID.endsWith("video")).sort((a, b) => b.data - a.data);
    let title;
    let author;

    for (var i = vids.length - 1; i >= 0; i--) {
        let username = db.fetch(`${vids[i].ID.split('_')[0]}_username`);
        let filename = db.fetch(`${vids[i].ID.split('_')[0]}_fname`);
        let videotitle = db.fetch(`${vids[i].ID.split('_')[0]}_video`);
        if (filename === fixd) {
            title = videotitle;
            author = username;
            break;
        }
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta content='text/html; charset=UTF-8' http-equiv='Content-Type' />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:site" content="/" />
        <meta name="twitter:title" content="${author}" />
        <meta name="twitter:description" content="${title}" />
        <meta name="twitter:image" content="/thumbnail/${fixd}.jpg" />
        <meta name="twitter:player" content="/files/${fixd}" />
        <meta name="twitter:player:width" content="320" />
        <meta name="twitter:player:height" content="180" />
        <meta name="twitter:player:stream" content="/files/${fixd}" />
        <meta name="twitter:player:stream:content_type" content="video/mp4" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
        <title>UNSAFE VIDEO HOSTING 3000 | trim.13da2ae9-9bb2-47c8-90c4-6623b32e90f7.mov</title>
        <meta property="og:site_name" content="UNSAFE VIDEO HOSTING 3000">
        <meta property="og:title" content="${author}">
        <meta property="og:image" content="/thumbnail/${fixd}.jpg">
        <meta property="og:video:type" content="text/html">
        <meta property="og:video:url" content="https://video.chrysa.eu/embed?v=${fixd}">
        <meta property="og:video:height" content="720">
        <meta property="og:video:width" content="1280">
        <meta property="og:type" content="video.other">
        <meta name="twitter:card" content="summary_large_image">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${fixd}">
        <meta property="og:url" content="/videos?v=${fixd}">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
        <style>
            body {
                width: 100%;
                height: 100%;
                max-height: 1500px;
                margin: 40px auto;
                max-width: 1500px;
                background-color: #000;
                color: #fff;
            }
            
            .contents {
                position: relative;
                width: 90%;
                max-width: 1000px;
                justify-content: center;
                margin-inline: auto;
                background-color: black;
            }
        </style>
        <script type="text/javascript">
            function copy() {
    
                var copyText = document.getElementById("linkCopy");
    
                copyText.select();
                copyText.setSelectionRange(0, 99999);
    
                document.execCommand("copy");
    
            }
        </script>
        <link rel="stylesheet" href="/files/style.css">
        <script src="/files/script.js" defer></script>
    </head>
    
    <body>
        <div class="video-container paused" data-volume-level="high">
            <div class="video-controls-container">
                <div class="timeline-container">
                    <div class="timeline">
                        <div class="thumb-indicator"></div>
                    </div>
                </div>
                <div class="controls">
                    <button class="play-pause-btn">
              <svg class="play-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
              <svg class="pause-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              </svg>
            </button>
                    <div class="volume-container">
                        <button class="mute-btn">
                <svg class="volume-high-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                </svg>
                <svg class="volume-low-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z" />
                </svg>
                <svg class="volume-muted-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" />
                </svg>
              </button>
                        <input class="volume-slider" type="range" min="0" max="1" step="any" value="1">
                    </div>
                    <div class="duration-container">
                        <div class="current-time">0:00</div>
                        /
                        <div class="total-time"></div>
                    </div>
                    <button class="speed-btn wide-btn">
              1x
            </button>
                    <button class="mini-player-btn">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"/>
              </svg>
            </button>
                    <button class="theater-btn">
              <svg class="tall" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/>
              </svg>
              <svg class="wide" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/>
              </svg>
            </button>
                    <button class="full-screen-btn">
              <svg class="open" viewBox="0 0 24 24">
                <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              <svg class="close" viewBox="0 0 24 24">
                <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              </svg>
            </button>
                </div>
            </div>
            <video src="./files/${fixd}" type="video/mp4" autoplay></video>
        </div>
        <div class="contents">
            <h1 style="color:#fff;padding-top:1.75%;">${quotes[result]}</h1>
            <h2 style="color:#343a40">${viewCount} clicks</h2>
            <a style="font-size:28px;" href="/main">back to main</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" value="https://video.chrysa.eu/files/${fixd}" id="linkCopy"> <button onclick="copy()">To Clipboard</button>
            <p></p>
            <form style="margin-top:5%;" id="commentForm" action="/comment" method="post">
                <input type="hidden" name="videoname" value="${fixd}" required>
                <input type="text" name="username" placeholder="username" required>&nbsp;
                <input type="text" name="comment" placeholder="comment" required>
                <br><br>
                <input type="submit" value="Comment" name="submit"><br><br>
                <span id="status"></span>
            </form>
            ${comsection}
            <br><br>
        </div>
    </body>
    
    </html>
    `);
});

app.use("/images", async function (req, res) {

    let pics = db.all().filter((data) => data.ID.endsWith("photo")).sort((a, b) => b.data - a.data);
    let list = [];

    for (var i = pics.length - 1; i >= 0; i--) {
        let username = db.fetch(`${pics[i].ID.split('_')[0]}_username`);
        let img = db.fetch(`${pics[i].ID.split('_')[0]}_pname`);
        if (username === null) username = "anonymous";
        list.push(`<div id="${i + 1}" class="column" style="float:left;width:100%;"><p><a href="./files/${img}"><img src="./files/${img}" width="100" height="100" border="2px"></a>&nbsp;&nbsp;<p style="display:grid;color:#fff"><b>${username}</b> ${pics[i].data}</p></p></p></div>`);
    }

    res.send(`
<!DOCTYPE html>
<html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>UNSAFE VIDEO HOSTING 3000 | criminally unsafe video streaming (how is this still up)</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <style>
        body {
            width: 100%;
            height: 100%;
            margin: 40px auto;
            max-height: 1500px;
            max-width: 1500px;
            background-color: #000;
        }
        blockquote {
            margin: 40px auto;
            max-width: 500px;
            color: #fff;
            text-align: center;
        }
    </style>
    <meta content="UNSAFE VIDEO HOSTING 3000" property="og:title" />
    <meta content="world's most unsafe video streaming website" property="og:description" />
    <meta content="/" property="og:url" />
    <meta content="https://c.tenor.com/4ZkIt5fjuwIAAAAC/detroit.gif" property="og:image" />
    <meta content="#000000" data-react-helmet="true" name="theme-color" />
</head>

<body>
<center>
    <br>
    <img style="width:100%;height:100%;max-width:600px;max-height:180px;" src="./files/logo.gif">
    <br><br>

<hr style="color:white;margin: 40px auto;max-width: 500px;">
    
<a href="/">upload video</a>&nbsp;&nbsp;<a href="/img">upload image</a>&nbsp;&nbsp;<a href="/dioau">upload audio</a>
<hr style="color:white;margin: 40px auto;max-width: 500px;">
<br><br><br>
<div class="row" style="content:;clear: both;display: table;">
${list.join("")}
</div>
<br><br><hr style="color:white;margin: 40px auto;max-width: 500px;">
    </body></center></html>
    `)
});

app.use("/audio", async function (req, res) {

    let audio = db.all().filter((data) => data.ID.endsWith("audio")).sort((a, b) => b.data - a.data);
    let list = [];

    for (var i = audio.length - 1; i >= 0; i--) {
        let username = db.fetch(`${audio[i].ID.split('_')[0]}_username`);
        let adio = db.fetch(`${audio[i].ID.split('_')[0]}_aname`);
        if (adio.includes("ogg")) type = "ogg"
        else type = "mpeg";
        if (username === null) username = "anonymous";
        list.push(`<div id="${i + 1}" class="column" style="float:center;width:100%;"><p><a href="./files/${adio}"><audio controls><source src="./files/${adio}" type="audio/${type}"></audio></a>&nbsp;&nbsp;<p style="display:grid;text-align:center;color:#fff"><b>${username}</b> ${audio[i].data}</p></p></p></div>`);
    }

    res.send(`
<!DOCTYPE html>
<html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>UNSAFE VIDEO HOSTING 3000 | criminally unsafe video streaming (how is this still up)</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <style>
        body {
            width: 100%;
            height: 100%;
            margin: 40px auto;
            max-height: 1500px;
            max-width: 1500px;
            background-color: #000;
        }
        blockquote {
            margin: 40px auto;
            max-width: 500px;
            color: #fff;
            text-align: center;
        }
    </style>
    <meta content="UNSAFE VIDEO HOSTING 3000" property="og:title" />
    <meta content="world's most unsafe video streaming website" property="og:description" />
    <meta content="/" property="og:url" />
    <meta content="https://c.tenor.com/4ZkIt5fjuwIAAAAC/detroit.gif" property="og:image" />
    <meta content="#000000" data-react-helmet="true" name="theme-color" />
</head>

<body>
<center>
    <br>
    <img style="width:100%;height:100%;max-width:600px;max-height:180px;" src="./files/logo.gif">
    <br><br>

<hr style="color:white;margin: 40px auto;max-width: 500px;">
    
<a href="/">upload video</a>&nbsp;&nbsp;<a href="/img">upload image</a>&nbsp;&nbsp;<a href="/dioau">upload audio</a>
<hr style="color:white;margin: 40px auto;max-width: 500px;">
<br><br><br>
<div class="row" style="content:;clear: both;display: table;">
${list.join("")}
</div>
<br><br><hr style="color:white;margin: 40px auto;max-width: 500px;">
    </body></center></html>
    `)
});

app.get("/dox", async function (req, res) {

    let { body } = await superagent
        .get(`http://api.ipstack.com/${req.ip.replace("::ffff:", "")}?access_key=b7be4f0107783dda48188ee3bd462be6`);

    res.send(`
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <meta property="og:image" content="/files/dox.jpg" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="800" />
    <meta property="og:title" content="you should dox yourself now" />
    <meta property="og:url" content="/dox" />
    <title>UNSAFE VIDEO HOSTING 3000 | doxxed</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <style>
        body {
            width: 100%;
            height: 100%;
            max-height: 1500px;
            margin: 40px auto;
            max-width: 1500px;
            background-color: #000;
        }
    </style>
<script>
function copy() {

  var copyText = document.getElementById("linkCopy");

  copyText.select();
  copyText.setSelectionRange(0, 99999); 

  document.execCommand("copy");
  
}
</script>
</head>

<body>
   <center> 
   <br><br><br>
   <p>IP: ${body.ip}<br><br>Type: ${body.type}<br><br>Continent: ${body.continent_name}<br><br>Country: ${body.country_name}<br><br>Region: ${body.region_name}<br><br>City: ${body.city}<br><br>Zip Code: ${body.zip}<br><br>Latitude: ${body.latitude}<br><br>Longitude: ${body.longitude}</p>
   <br><br><br>
   </center>
</body>
</html>
`)

});

const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

httpServer.listen(port, () => {
    console.log('HTTP Server running on port ' + port);
});