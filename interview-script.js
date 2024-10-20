const videoElement = document.getElementById('video');
let videoStream, audioStream, mediaRecorder;
let videoEnabled = true;
let audioEnabled = true;

let timeoutId;
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
    // Start the conversation
    loadGeminiAI("Start a mock interview. Introduce yourself as the AI interviewer and ask the first question.");
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



// Gemini AI setup
window.config = {
    API_KEY: 'AIzaSyDPtcTAIt-nZsjp3qOKZP9e8w3RwtFnLsE'
};

const importMap = {
    imports: {
    "@google/generative-ai": "https://esm.run/@google/generative-ai"
    }
};

const importMapScript = document.createElement('script');
importMapScript.type = 'importmap';
importMapScript.textContent = JSON.stringify(importMap);
document.head.appendChild(importMapScript);

async function loadGeminiAI(userInput) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const API_KEY = window.config.API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    async function generate() {
        const prompt = `This is a mock interview. You are the AI interviewer. The candidate said: "${userInput}". Provide a brief response or follow-up question based on this input. Keep your response concise and relevant to a job interview context.`;

        try {
            let aiResponseDiv = document.querySelector('.ai-response');
            if (aiResponseDiv) {
                aiResponseDiv.textContent = 'Generating response...';
            }
    
            const result = await model.generateContent(prompt);
            const generatedText = result.response.text();
            console.log("Generated text:", generatedText);
            
            if (aiResponseDiv) {
                aiResponseDiv.textContent = generatedText;
            }
    
            // Text-to-speech
            speechSynthesis.cancel();
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
            }
    
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(generatedText);
                utterance.rate = 1.0;
                
                utterance.onstart = () => console.log('Speech started');
                utterance.onend = () => {
                    console.log('Speech ended');
                    startListening(); // Start listening for the next response
                };
                utterance.onerror = (event) => console.error('Speech error:', event);
                
                speechSynthesis.speak(utterance);
            }, 100);
    
        } catch (error) {
            console.error("Error generating content:", error);
            if (aiResponseDiv) {
                aiResponseDiv.textContent = 'Error generating content. Please try again.';
            }
            startListening(); // Start listening even if there's an error
        }
    }
    generate();
}


// const prompts = [
//     "The candidate is preparing for a mock interview. Please start by asking them about their background: 'Can you tell me about yourself? What position are you interviewing for, and what prior experience or skills do you have related to this role?",
//     "The interviewee is applying for the position of [job_role] and has mentioned [specific skills/experience]. Please generate a follow-up question to ask about their experience using [specific skills] in a professional setting, as well as how these skills can be applied to the role they're seeking",
//     "Ask the interviewee a behavioral question based on their job role, like 'Can you describe a time when you faced a significant challenge at work and how you overcame it? How did you ensure a positive outcome, and what did you learn from the experience?",
//     "The interviewee is applying for a software developer position. Please generate a technical question to assess their proficiency in [specific programming language, framework, or tool], and include follow-up questions to understand how they troubleshoot issues and optimize code performance."
// ];
// for(let i = 0; i < prompts.length; i++){
//     timeoutId = setTimeout(() => {
//         loadGeminiAI(prompts[i] + "ask a short question of one line to the candidate");
//     }, 10000);
    
// }
// loadGeminiAI();

// Speech recognition setup

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        const outputDiv = document.querySelector('.candidate-response');

        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            outputDiv.innerHTML = finalTranscript + '<i style="color:#999;">' + interimTranscript + '</i>';
            console.log(finalTranscript );
            if (event.results[event.results.length - 1].isFinal) {
                stopListening();
                loadGeminiAI(finalTranscript);
            } 
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            outputDiv.textContent = 'Error: ' + event.error;
            startListening(); //restart listening in case of error
        };

        function startListening() {
            recognition.start();
            outputDiv.textContent = 'Listening...';
        }

        function stopListening() {
            recognition.stop();
        }

        // Event listener for the start button
        startButton.addEventListener('click', startListening);

        // Check for browser support
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            outputDiv.textContent = 'Speech recognition not supported in this browser.';
            startButton.disabled = true;
        }