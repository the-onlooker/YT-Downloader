// index.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Get the form element
  const form = document.getElementById('download-form');

  // Add an event listener to the form submission
  form.addEventListener('submit', event => {
    event.preventDefault(); // Prevent the default form submission

    // Get the video URL entered by the user
    const videoURL = document.getElementById('video-url').value;

    // Set the output file names
    const videoOutput = 'video.mp4';
    const audioOutput = 'audio.mp3';
    const mergedOutput = 'merged.mp4';

    // Download video
    const videoStream = ytdl(videoURL, { quality: 'highest' });
    videoStream.pipe(fs.createWriteStream(videoOutput));

    // Download audio
    const audioStream = ytdl(videoURL, { quality: 'highestaudio' });
    audioStream.pipe(fs.createWriteStream(audioOutput));

    // Wait for both streams to finish downloading
    Promise.all([
      new Promise(resolve => videoStream.on('finish', resolve)),
      new Promise(resolve => audioStream.on('finish', resolve))
    ])
      .then(() => {
        // Merge video and audio using ffmpeg
        ffmpeg()
          .input(videoOutput)
          .input(audioOutput)
          .outputOptions('-c:v copy')
          .outputOptions('-c:a aac')
          .save(mergedOutput)
          .on('end', () => {
            console.log('Merging complete!');
            // Clean up temporary files
            fs.unlinkSync(videoOutput);
            fs.unlinkSync(audioOutput);
          });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});
