import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "AIzaSyDIQ8OEYSD3yt8802kxZXhOPRNcBPSmtIc";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSendBtn = document.getElementById('chatbot-send-btn');
const stopBtn = document.getElementById('stop-btn');

let isResponding = false;
let shouldStop = false;

chatbotToggle.addEventListener('click', toggleChatbot);
chatbotSendBtn.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
stopBtn.addEventListener('click', stopResponse);

function toggleChatbot() {
    if (chatbotContainer.style.display === 'none') {
        chatbotContainer.style.display = 'flex';
    } else {
        chatbotContainer.style.display = 'none';
    }
}

async function sendMessage() {
    if (isResponding) return;

    const userMessage = chatbotInput.value.trim();
    if (userMessage === '') return;

    appendMessage('user', userMessage);
    chatbotInput.value = '';
    isResponding = true;
    shouldStop = false;
    updateUIState();

    showThinking();

    try {
        const result = await model.generateContent(userMessage);
        removeThinking();
        const botMessage = result.response.text();
        await typeMessageWithPauses(botMessage);
    } catch (error) {
        console.error('Error:', error);
        removeThinking();
        appendMessage('bot', 'Sorry, something went wrong.');
    } finally {
        isResponding = false;
        updateUIState();
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

    const contentElement = document.createElement('p');
    contentElement.style.margin = '0';
    contentElement.textContent = message;
    messageElement.appendChild(contentElement);

    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function typeMessageWithPauses(message) {
    const botMessageElement = document.createElement('div');
    botMessageElement.classList.add('message', 'bot-message');
    chatbotMessages.appendChild(botMessageElement);

    const contentElement = document.createElement('p');
    contentElement.style.margin = '0';
    botMessageElement.appendChild(contentElement);

    const words = message.split(' ');
    for (let i = 0; i < words.length; i++) {
        if (shouldStop) break;
        contentElement.textContent += words[i] + ' ';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, 50)); // Adjust typing speed here
    }
}

function showThinking() {
    const thinkingElement = document.createElement('div');
    thinkingElement.classList.add('thinking');
    thinkingElement.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatbotMessages.appendChild(thinkingElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeThinking() {
    const thinkingElement = chatbotMessages.querySelector('.thinking');
    if (thinkingElement) {
        chatbotMessages.removeChild(thinkingElement);
    }
}

function stopResponse() {
    shouldStop = true;
}

function updateUIState() {
    chatbotSendBtn.disabled = isResponding;
    chatbotInput.disabled = isResponding;
    stopBtn.style.display = isResponding ? 'inline-block' : 'none';
    chatbotSendBtn.style.display = isResponding ? 'none' : 'inline-block';
}

// Initial greeting message
appendMessage('bot', 'Hello! I\'m a Medical Q&A Chatbot. How can I assist you today?');