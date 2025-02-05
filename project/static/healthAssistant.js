import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "AIzaSyDIQ8OEYSD3yt8802kxZXhOPRNcBPSmtIc"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const questions = [
    { id: 'name', name: 'name', text: 'What is your name?', type: 'text' },
    { id: 'age', name: 'age', text: 'What is your age?', type: 'number' },
    { id: 'gender', name: 'gender', text: 'What is your gender?', type: 'select', options: ['Male', 'Female', 'Other'] },
    { id: 'height', name: 'height', text: 'What is your height (in cm)?', type: 'number' },
    { id: 'weight', name: 'weight', text: 'What is your weight (in kg)?', type: 'number' },
    { id: 'occupation', name: 'occupation', text: 'What is your occupation?', type: 'text' },
    { id: 'exercise', name: 'exercise', text: 'How often do you exercise?', type: 'select', options: ['Never', 'Occasionally', 'Regularly', 'Daily'] },
    { id: 'diet',name: 'diet', text: 'How would you describe your current diet?', type: 'select', options: ['Balanced', 'High in processed foods', 'Vegetarian', 'Vegan', 'Other'] },
    { id: 'medicalConditions',name: 'medicalConditions', text: 'Do you have any existing medical conditions?', type: 'text' },
    { id: 'stress',name: 'stress', text: 'How would you rate your stress level?', type: 'select', options: ['Low', 'Moderate', 'High', 'Very High'] }
];

let currentQuestionIndex = 0;
const answers = {};

function displayQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const currentQuestion = questions[currentQuestionIndex];
    
    let questionHTML = `<h3 class="fade-in">${currentQuestion.text}</h3>`;
    
    if (currentQuestion.type === 'select') {
        questionHTML += `<select id="${currentQuestion.id}" class="fade-in">`;
        currentQuestion.options.forEach(option => {
            questionHTML += `<option value="${option}">${option}</option>`;
        });
        questionHTML += '</select>';
    } else {
        questionHTML += `<input type="${currentQuestion.type}" id="${currentQuestion.id}" class="fade-in">`;
    }
    
    questionHTML += '<button onclick="nextQuestion()" class="fade-in">Next</button>';
    
    questionContainer.innerHTML = questionHTML;
}

function nextQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = document.getElementById(currentQuestion.id).value;
    
    if (answer.trim() === '') {
        alert('Please answer the question before proceeding.');
        return;
    }
    
    answers[currentQuestion.id] = answer;
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showSubmitButton();
    }
}
function showSubmitButton() {
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('submitBtn').addEventListener('click', () => {
        generateRecommendations().then(() => {
            submitForm();  // Ensure this is called after recommendations are generated
        });
    });
}

function submitForm() {
    // Populate the hidden form fields with the answers
    Object.keys(answers).forEach(key => {
        const hiddenInput = document.getElementById(`hidden-${key}`);
        if (hiddenInput) {
            hiddenInput.value = answers[key];
        }
    });

    // Submit the hidden form
    document.getElementById('hidden-form').submit();
}

async function generateRecommendations() {
    const recommendationContainer = document.getElementById('recommendationContainer');
    recommendationContainer.style.display = 'block';
    
    const prompt = `Based on the following health information, provide personalized recommendations for a diet plan, meal recipes, health precautions, and safety guidelines. Include specific advice from WHO guidelines where applicable. Here's the patient information:

    Name: ${answers.name}
    Age: ${answers.age}
    Gender: ${answers.gender}
    Height: ${answers.height} cm
    Weight: ${answers.weight} kg
    Occupation: ${answers.occupation}
    Exercise Frequency: ${answers.exercise}
    Current Diet: ${answers.diet}
    Medical Conditions: ${answers.medicalConditions}
    Stress Level: ${answers.stress}

    Please provide detailed recommendations in the following format:
    1. Diet Plan:
    2. Meal Recipes in details like how to prepare it from scratch:
    3. Health Precautions:
    4. Safety Guidelines:
    And specially provide the current diease pattern accoding to who data from which maximum patient are suffering and
    always generate an unique and engazing article to educate the user about the same
    Also suggest home remedy or general household methods to cure the current medical condition of the user 
    And provide the meal recipies and diet plan in details and try to suggest the easily aavailable meal spcially in India
     `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const sections = text.split(/\d+\.\s+/).slice(1);
        
        const containers = ['dietPlan', 'mealRecipes', 'healthPrecautions', 'safetyGuidelines'];
        containers.forEach((container, index) => {
            if (sections[index]) {
                typeText(document.getElementById(container), sections[index].trim());
            }
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('dietPlan').innerHTML = '<p>Sorry, there was an error generating recommendations. Please try again later.</p>';
    }
    
    document.getElementById('submitBtn').style.display = 'none';
}







function typeText(element, text) {
    let index = 0;
    element.innerHTML = '';
    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 20);
        } else {
            element.classList.add('fade-in');
        }
    }
    type();
}

// Start the questionnaire
displayQuestion();

// Make nextQuestion available globally
window.nextQuestion = nextQuestion;