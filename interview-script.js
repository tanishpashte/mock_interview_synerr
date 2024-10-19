const videoElement = document.getElementById('video');
let videoStream, audioStream, mediaRecorder;
let videoEnabled = true;
let audioEnabled = true;

async function startInterview() {
    // Access video and audio streams
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoElement.srcObject = stream;

    videoStream = stream.getVideoTracks()[0];
    audioStream = stream.getAudioTracks()[0];

    // Start recording video/audio
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    // Send video chunks in real-time
    mediaRecorder.ondataavailable = (event) =>
    {
        const formData = new FormData();
        formData.append('interview_recording', event.data);

        fetch('/interview', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    };

    // Audio extraction every 5 seconds
    setInterval(() => {
        const audioBlob = new Blob([audioStream], { type: 'audio/webm' });
        const audioFormData = new FormData();
        audioFormData.append('audio_recording', audioBlob);

        fetch('/interview/audio', {
            method: 'POST',
            body: audioFormData
        })
        .then(response => response.json())
        .then(data => console.log("Audio processed", data))
        .catch(error => console.error('Audio Error:', error));
    }, 5000); // Sends audio every 5 seconds
}

// Toggle video on/off
document.getElementById('toggle-video').addEventListener('click', () => {
    videoEnabled = !videoEnabled;
    videoStream.enabled = videoEnabled;
    document.getElementById('toggle-video').textContent = videoEnabled ? 'Turn Video Off' : 'Turn Video On';
});

// Toggle audio on/off
document.getElementById('toggle-audio').addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioStream.enabled = audioEnabled;
    document.getElementById('toggle-audio').textContent = audioEnabled ? 'Turn Audio Off' : 'Turn Audio On';
});

// Start interview automatically when page loads
window.onload = startInterview;