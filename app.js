const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const uploadedVideos = {};

app.post('/upload_video', upload.single('video_file'), (req, res) => {
  const videoPath = path.join(__dirname, 'uploads', req.file.originalname);
  const subtitlesData = req.body.subtitles;

  // Save video file
  uploadedVideos[videoPath] = {
    subtitlesFile: `uploads/${req.file.originalname.split('.')[0]}.srt`,
    subtitles: subtitlesData
  };

  // Save subtitles data
  const subtitlesFilePath = path.join(__dirname, uploadedVideos[videoPath].subtitlesFile);
  const subtitlesContent = subtitlesData.map(subtitle => `${subtitle.timestamp} --> ${subtitle.timestamp + 2}\n${subtitle.text}\n\n`).join('');
  fs.writeFileSync(subtitlesFilePath, subtitlesContent);

  res.json({ message: 'Video and subtitles uploaded successfully' });
});

app.get('/get_subtitles/:videoPath', (req, res) => {
  const videoPath = path.join(__dirname, 'uploads', req.params.videoPath);
  const videoData = uploadedVideos[videoPath];

  if (videoData) {
    const subtitlesFilePath = path.join(__dirname, videoData.subtitlesFile);
    const subtitlesContent = fs.readFileSync(subtitlesFilePath, 'utf-8');
    res.send(subtitlesContent);
  } else {
    res.json({ error: 'Video not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
