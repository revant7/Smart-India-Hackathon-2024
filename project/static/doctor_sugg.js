import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "AIzaSyDIQ8OEYSD3yt8802kxZXhOPRNcBPSmtIc"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const problemInput = document.getElementById('problem');
const locationInput = document.getElementById('location');
const severitySelect = document.getElementById('severity');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');

searchBtn.addEventListener('click', searchSpecialists);

async function searchSpecialists() {
    const problem = problemInput.value.trim();
    const location = locationInput.value.trim();
    const severity = severitySelect.value;

    if (!problem || !location) {
        alert('Please enter both a medical problem and a location.');
        return;
    }

    showLoading();

    const prompt = `Request for Doctor and Hospital Recommendations

Problem: ${problem}
Location: ${location}
Severity Level: ${severity}

Please provide a detailed list of doctors and hospitals that specialize in treating ${problem} in ${location} for the ${severity.toLowerCase()} severity level. List at least 5 relevant options, ensuring real-time data accuracy. Organize the information as follows:

1. Name: [Doctor/Hospital Name]
2. Specialization: [Field of Expertise]
3. Address: [Full Address]
4. Contact Information:
   Phone: [Phone Number]
   Email: [Email Address]
   Website: [Official Website Link]
5. Timings: [Available Hours]
6. User Reviews: [Average Rating and Brief Summary of Comments]
7. Why Recommended: [Brief explanation of why this option is suitable for the given problem and severity]

Please ensure that all information provided is accurate, up-to-date, and relevant to the specified medical problem, location, and severity level. If there are any notable certifications, awards, or unique treatment approaches, please include those as well.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        displayResults(text);
    } catch (error) {
        console.error('Error:', error);
        displayResults('An error occurred while searching for specialists. Please try again later.');
    } finally {
        hideLoading();
    }
}

function displayResults(content) {
    const formattedContent = formatResults(content);
    resultsContainer.innerHTML = formattedContent;
}

function formatResults(content) {
    // Split the content into sections for each recommendation
    const sections = content.split(/\d+\.\s+Name:/);
    
    // Remove any empty sections
    const filteredSections = sections.filter(section => section.trim() !== '');
    
    // Format each section
    const formattedSections = filteredSections.map((section, index) => {
        const lines = section.split('\n');
        const name = lines[0].trim();
        const rest = lines.slice(1).join('\n');
        
        return `
            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 class="text-xl font-bold mb-2">${index + 1}. ${name}</h2>
                <pre class="whitespace-pre-wrap">${rest}</pre>
            </div>
        `;
    });
    
    return formattedSections.join('');
}

function showLoading() {
    loadingIndicator.classList.remove('hidden');
    resultsContainer.innerHTML = '';
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}