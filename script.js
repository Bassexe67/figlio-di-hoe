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
        return 'Ciao! Sono sommo67, un AI assistente con accesso a informazioni da Wikipedia. Come posso aiutarti oggi? 👋';
    }
    
    // Come stai
    if (msg.match(/come stai|come vai|come ti senti/i)) {
        return 'Sto perfettamente! Come AI, sono sempre operativo. Ho accesso a miliardi di informazioni. Come posso assisterti? 😊';
    }
    
    // Chi sei
    if (msg.match(/chi sei|che cos'è|presentati|cosa puoi fare/i)) {
        return 'Sono sommo67, un assistente AI conversazionale con accesso a informazioni da Wikipedia e il web. Posso rispondere a quasi qualsiasi domanda! 🤖';
    }
    
    // Cosa puoi fare
    if (msg.match(/cosa puoi|che cosa fai|quali funzioni/i)) {
        return 'Posso cercare informazioni su Wikipedia, rispondere a domande, dare spiegazioni dettagliate, avere conversazioni intelligenti e aiutarti a risolvere problemi. Chiedi pure!';
    }
    
    // Aiuto
    if (msg.match(/aiuto|help|puoi aiutarmi/i)) {
        return 'Ovviamente! Sono qui proprio per questo. Raccontami il tuo problema o domanda e farò il mio meglio, cercando anche informazioni se necessario!';
    }
    
    // Ringraziamenti
    if (msg.match(/grazie|thanks|merci/i)) {
        return 'Prego! È un piacere aiutare. C\'è altro che posso fare per te? 😄';
    }
    
    // Arrivederci
    if (msg.match(/arrivederci|goodbye|bye|a presto|ciao ciao/i)) {
        return 'Arrivederci! È stato un piacere chattare con te. Torna pure quando hai bisogno! 👋';
    }
    
    // Domande su cosa sia l'IA
    if (msg.match(/cosa è.*ia|cos'è l'intelligenza|come funzioni/i)) {
        return 'Sono basato su reti neurali profonde e modelli di linguaggio avanzati. Elaboro il tuo testo e genero risposte intelligenti. Ho anche accesso a Wikipedia per fornire informazioni accurate e aggiornate!';
    }
    
    // Per domande generiche - cerca su Wikipedia
    if (msg.length > 5) {
        const searchTerms = extractKeywords(msg);
        if (searchTerms) {
            const wikiInfo = await searchWikipedia(searchTerms);
            if (wikiInfo) {
                return wikiInfo;
            }
        }
    }
    
    // Risposte conversazionali intelligenti
    const conversationalResponses = [
        'Interessante! Puoi approfondire? Mi interesserebbe saperne di più.',
        'Buona osservazione! Quali sono i tuoi pensieri al riguardo?',
        'Come vedi la situazione? Raccontami di più!',
        'Non male! Cosa ti spinge a dirlo?',
        'Capisco perfettamente. Ci sono altri dettagli che vorresti condividere?'
    ];
    
    return conversationalResponses[Math.floor(Math.random() * conversationalResponses.length)];
}

async function searchWikipedia(query) {
    try {
        const response = await fetch(
            `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
        );
        const data = await response.json();
        
        if (data.query.search.length === 0) {
            return null;
        }
        
        const firstResult = data.query.search[0];
        const pageTitle = firstResult.title;
        
        // Ottieni il contenuto della pagina
        const pageResponse = await fetch(
            `https://it.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&explaintext=true&exintro=true&format=json&origin=*`
        );
        const pageData = await pageResponse.json();
        const page = Object.values(pageData.query.pages)[0];
        
        if (page.extract) {
            let extract = page.extract;
            // Limita a 200 caratteri
            if (extract.length > 300) {
                extract = extract.substring(0, 300) + '...';
            }
            return `📖 **${pageTitle}**\n\n${extract}\n\n[Leggi di più su Wikipedia](https://it.wikipedia.org/wiki/${encodeURIComponent(pageTitle)})`;
        }
        
        return null;
    } catch (error) {
        console.log('Errore ricerca Wikipedia:', error);
        return null;
    }
}

function extractKeywords(text) {
    // Rimuovi parole comuni
    const stopWords = ['che', 'cosa', 'quando', 'dove', 'come', 'per', 'è', 'sono', 'sei', 'hai', 'puoi', 'mi', 'ti', 'lo', 'la', 'un', 'uno', 'una', 'e', 'o', 'di', 'da', 'il', 'su', 'con'];
    const words = text.split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w.toLowerCase()));
    return words.slice(0, 3).join(' ');
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
