// DOM elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let conversationHistory = [];
let classifier = null;
let isModelLoading = true;

// Carica il modello di IA
async function loadModel() {
    try {
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
        classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
        isModelLoading = false;
        console.log('Modello IA caricato!');
    } catch (e) {
        console.log('Modello non disponibile, usando risposte intelligenti');
        isModelLoading = false;
    }
}

loadModel();

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    
    // Clear input
    messageInput.value = '';
    messageInput.focus();
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = '<div class="message-bubble"><div class="message-content typing">sommo67 sta scrivendo...</div></div>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate bot thinking and response
    setTimeout(async () => {
        typingDiv.remove();
        const response = await getAIResponse(message);
        addMessage(response, 'bot');
        conversationHistory.push({ role: 'bot', content: response });
    }, 800);
}

async function getAIResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    
    // Saluti
    if (msg.match(/^(ciao|hello|hi|buongiorno|buonasera|hey|salve)/i)) {
        return 'Ciao! Sono sommo67, un AI assistente. Come posso aiutarti oggi? 👋';
    }
    
    // Come stai
    if (msg.match(/come stai|come vai|come ti senti/i)) {
        return 'Sto perfettamente! Come AI, sono sempre operativo e pronto ad aiutarti. Come posso assisterti? 😊';
    }
    
    // Chi sei
    if (msg.match(/chi sei|che cos'è|presentati|cosa puoi fare/i)) {
        return 'Sono sommo67, un assistente AI conversazionale. Posso aiutarti con domande, conversazioni, spiegazioni e molto altro. Provami! 🤖';
    }
    
    // Cosa puoi fare
    if (msg.match(/cosa puoi|che cosa fai|quali funzioni/i)) {
        return 'Posso: rispondere a domande, dare spiegazioni, avere conversazioni intelligenti, aiutarti a risolvere problemi e molto altro. Dimmi pure cosa ti interessa!';
    }
    
    // Aiuto
    if (msg.match(/aiuto|help|puoi aiutarmi/i)) {
        return 'Ovviamente! Sono qui proprio per quello. Raccontami il tuo problema o la tua domanda e farò il mio meglio per aiutarti!';
    }
    
    // Ringraziamenti
    if (msg.match(/grazie|thanks|merci/i)) {
        return 'Prego! È un piacere aiutare. C\'è altro che posso fare per te? 😄';
    }
    
    // Arrivederci
    if (msg.match(/arrivederci|goodbye|bye|a presto|ciao ciao/i)) {
        return 'Arrivederci! È stato un piacere chattare con te. Torna pure quando vuoi! 👋';
    }
    
    // Domande su cosa sia l'IA
    if (msg.match(/cosa è.*ia|cos'è l'intelligenza|come funzioni/i)) {
        return 'Sono basato su reti neurali profonde e modelli di linguaggio. Elaboro il tuo testo e genero risposte intelligenti basate su miliardi di dati linguistici. Sono progettato per capire il contesto e conversare naturalmente!';
    }
    
    // Domande generiche - risposte intelligenti
    if (msg.match(/\?$/)) {
        const responses = [
            'È una domanda interessante! Dal mio punto di vista: ' + generateThoughtful(msg),
            'Buona domanda! Ti direi che: ' + generateThoughtful(msg),
            'Mmmh, interessante... Penso che: ' + generateThoughtful(msg)
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Risposte conversazionali intelligenti
    const conversationalResponses = [
        'Capisco quello che dici. Puoi approfondire? Mi interesserebbe saperne di più.',
        'Interessante perspective! Come ti è venuto in mente di dire questo?',
        'That makes sense. Quali sono i tuoi pensieri su questo argomento?',
        'Non male! Mi sembra una considerazione valida. E tu, cosa ne pensi veramente?',
        'Capisco perfettamente. Vuoi raccontarmi di più al riguardo?'
    ];
    
    return conversationalResponses[Math.floor(Math.random() * conversationalResponses.length)];
}

function generateThoughtful(message) {
    const thoughts = [
        'è una questione complessa che merita riflessione.',
        'dipende davvero dal contesto e da molti fattori.',
        'ci sono diversi punti di vista su questo tema.',
        'è affascinante come la tecnologia sta cambiando il mondo.',
        'credo che la risposta varia a seconda della prospettiva.'
    ];
    return thoughts[Math.floor(Math.random() * thoughts.length)];
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${escapeHtml(text)}</div>
            <div class="message-timestamp">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Focus on input field on load
messageInput.focus();
