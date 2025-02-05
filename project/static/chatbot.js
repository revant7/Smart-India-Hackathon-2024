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
let chat;
let markedLoaded = false;

chatbotToggle.addEventListener('click', toggleChatbot);
chatbotSendBtn.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
stopBtn.addEventListener('click', stopResponse);

function toggleChatbot() {
    chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'flex' : 'none';
}

async function initializeChat() {
    chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "You are a medical Q&A chatbot. Only answer questions related to healthcare, medicine, and general wellness. If a question is not related to these topics, politely inform the user that you can only assist with healthcare-related queries. Always format your responses using Markdown for better readability." }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am a medical Q&A chatbot specializing in healthcare, medicine, and general wellness topics. I will only answer questions related to these areas and will use Markdown formatting for better readability in my responses. If a question is outside my scope, I'll politely inform the user and redirect them to ask healthcare-related questions." }]
            }
        ],
    });
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
        if (!chat) {
            await initializeChat();
        }

        const result = await chat.sendMessage(userMessage);
        const botMessage = result.response.text();
        removeThinking();
        await typeMessageWithPauses(botMessage);
    } catch (error) {
        console.error('Error:', error);
        removeThinking();
        appendMessage('bot', 'Sorry, something went wrong. Please try again.');
    } finally {
        isResponding = false;
        updateUIState();
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    contentElement.innerHTML = markedLoaded ? marked.parse(message) : message;
    messageElement.appendChild(contentElement);

    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function typeMessageWithPauses(message) {
    const botMessageElement = document.createElement('div');
    botMessageElement.classList.add('message', 'bot-message');
    chatbotMessages.appendChild(botMessageElement);

    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    botMessageElement.appendChild(contentElement);

    const words = message.split(' ');
    let currentParagraph = '';

    for (let i = 0; i < words.length; i++) {
        if (shouldStop) break;
        currentParagraph += words[i] + ' ';

        if (words[i].endsWith('.') || words[i].endsWith('!') || words[i].endsWith('?') || i === words.length - 1) {
            contentElement.innerHTML += markedLoaded ? marked.parse(currentParagraph.trim()) : currentParagraph.trim();
            currentParagraph = '';
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 100)); // Pause after each sentence
        }

        await new Promise(resolve => setTimeout(resolve, 20)); // Adjust typing speed here
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

// Load the Marked library for Markdown parsing
function loadMarked() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => {
            console.log('Marked library loaded');
            markedLoaded = true;
            resolve();
        };
        script.onerror = () => {
            console.error('Failed to load Marked library');
            reject();
        };
        document.head.appendChild(script);
    });
}

// Initialize the chatbot
async function initChatbot() {
    try {
        await loadMarked();
    } catch (error) {
        console.error('Error loading Marked library:', error);
    }

    // Initial greeting message
    appendMessage('bot', '# Welcome to the Medical Q&A Chatbot\n\nHello! I\'m here to assist you with healthcare-related questions. How can I help you today?');
}

// Call initChatbot when the script loads
initChatbot();