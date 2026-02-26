// DOM elements - wait for DOM to be ready
let messagesContainer, messageInput, sendBtn;

function initializeDOM() {
    messagesContainer = document.getElementById('messages');
    messageInput = document.getElementById('messageInput');
    sendBtn = document.getElementById('sendBtn');
    
    if (!messagesContainer || !messageInput || !sendBtn) {
        console.error('DOM elementi non trovati!');
        return false;
    }
    
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Focus on input field on load
    messageInput.focus();
    console.log('DOM inizializzato correttamente');
    return true;
}

// Assicurasi che il DOM sia pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDOM);
} else {
    initializeDOM();
}

let conversationHistory = [];

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
        try {
            typingDiv.remove();
            const response = await getAIResponse(message);
            addMessage(response, 'bot');
            conversationHistory.push({ role: 'bot', content: response });
        } catch (error) {
            console.error('Errore:', error);
            typingDiv.remove();
            addMessage('Mi scusa, ho riscontrato un errore. Riprova!', 'bot');
        }
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
        return 'Sto perfettamente! Come AI, sono sempre operativo. Ho accesso a miliardi di informazioni da Wikipedia. Come posso assisterti? 😊';
    }
    
    // Chi sei / Cosa puoi fare
    if (msg.match(/chi sei|che cos'è|presentati|cosa puoi fare|quali funzioni/i)) {
        return 'Sono sommo67, un assistente AI con accesso a Wikipedia e capacità di ragionamento avanzate. Posso rispondere a quasi qualsiasi domanda con informazioni accurate, spiegazioni dettagliate e ragionamenti intelligenti. Chiedimi pure di qualsiasi argomento! 🤖';
    }
    
    // Aiuto
    if (msg.match(/aiuto|help|puoi aiutarmi/i)) {
        return 'Certo! Sono qui per aiutare. Dimmi pure cosa ti serve e farò il mio meglio per trovare risposte accurate e utili!';
    }
    
    // Ringraziamenti
    if (msg.match(/grazie|thanks|merci|apprezzo/i)) {
        return 'Prego! È un piacere aiutare. Hai altre domande? 😊';
    }
    
    // Arrivederci
    if (msg.match(/arrivederci|goodbye|bye|a presto|ciao ciao|buonanotte/i)) {
        return 'Arrivederci! È stato un piacere chattare con te. Torna pure quando hai bisogno! 👋';
    }
    
    // Per qualsiasi altra domanda - cerca informazioni pertinenti
    if (msg.length > 3) {
        const result = await intelligentSearch(msg);
        if (result) {
            return result;
        }
    }
    
    // Fallback
    return 'Interessante domanda! Puoi fornirmi più dettagli? In base a quello che mi dirai, cercherò le migliori informazioni per te.';
}

async function intelligentSearch(userMessage) {
    try {
        // Estrai i termini principali dalla domanda
        const keywords = extractSmartKeywords(userMessage);
        
        if (!keywords || keywords.length === 0) {
            return null;
        }
        
        // Cerca su Wikipedia con i keyword estratti
        for (const keyword of keywords) {
            try {
                const wikiResult = await getWikipediaInfo(keyword);
                if (wikiResult) {
                    // Formatta la risposta in modo intelligente
                    return formatIntelligentResponse(userMessage, wikiResult, keyword);
                }
            } catch (error) {
                console.log('Errore con keyword:', keyword, error);
                continue;
            }
        }
        
        return null;
    } catch (error) {
        console.log('Errore nella ricerca:', error);
        return null;
    }
}

function extractSmartKeywords(text) {
    // Rimuovi parole comuni e stop words
    const stopWords = new Set([
        'che', 'cosa', 'quando', 'dove', 'come', 'per', 'è', 'sono', 'sei', 'hai', 'puoi', 'mi', 'ti', 
        'lo', 'la', 'un', 'uno', 'una', 'e', 'o', 'di', 'da', 'il', 'su', 'con', 'da', 'per', 'a',
        'dal', 'alla', 'agli', 'dei', 'degli', 'delle', 'ne', 'ci', 'vi', 'in', 'tra', 'fra', 'il',
        'sono', 'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'fai', 'fa', 'facciamo', 'fate', 'fanno',
        'posso', 'puoi', 'può', 'possiamo', 'potete', 'possono', 'devo', 'devi', 'deve', 'dobbiamo',
        'dovete', 'devono', 'voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono', 'mi', 'ti',
        'gli', 'glie', 'ce', 've', 'se', 'lui', 'lei', 'loro', 'più', 'meno', 'molto', 'poco', 'tanto',
        'quale', 'quanti', 'quanto', 'questo', 'quello', 'stesso', 'altro', 'nuovo', 'vero', 'falso',
        'ai', 'al', 'degli', 'del', 'della', 'delle', 'dello', 'dell', 'ad', 'ab', 'accanto', 'addosso',
        'adesso', 'affatto', 'aggiunto', 'aiuto', 'al', 'altre', 'altri', 'altresì', 'altro', 'alzare'
    ]);
    
    const text = userMessage.toLowerCase().replaceAll(/[?!.,;:]/g, ' ');
    let words = text.split(/\s+/).filter(w => {
        return w.length > 2 && !stopWords.has(w);
    });
    
    // Prioritizza le parole lunghe (più specifiche)
    words.sort((a, b) => b.length - a.length);
    
    // Ritorna i primi 5 keyword, ordinati per importanza semantica
    return words.slice(0, 5);
}

async function getWikipediaInfo(query) {
    try {
        const searchResponse = await fetch(
            `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srwhat=text&srlimit=1&format=json&origin=*`
        );
        const searchData = await searchResponse.json();
        
        if (!searchData.query.search || searchData.query.search.length === 0) {
            return null;
        }
        
        const pageTitle = searchData.query.search[0].title;
        
        // Ottieni il contenuto della pagina
        const pageResponse = await fetch(
            `https://it.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&explaintext=true&exintro=true&exlimit=1&format=json&origin=*`
        );
        const pageData = await pageResponse.json();
        const page = Object.values(pageData.query.pages)[0];
        
        if (page.extract) {
            return {
                title: pageTitle,
                content: page.extract,
                url: `https://it.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`
            };
        }
        
        return null;
    } catch (error) {
        console.log('Errore ricerca Wikipedia:', error);
        return null;
    }
}

function formatIntelligentResponse(originalQuestion, wikiData, keyword) {
    const { title, content, url } = wikiData;
    
    // Riconosci il tipo di domanda
    const question = originalQuestion.toLowerCase();
    
    let intro = '';
    
    if (question.includes('chi era') || question.includes('chi è')) {
        intro = `Riguardo a "${title}": `;
    } else if (question.includes('cosa è') || question.includes('cos\'è')) {
        intro = `Per quanto riguarda "${title}": `;
    } else if (question.includes('quando')) {
        intro = `Per quanto riguarda "${title}", ecco cosa ho trovato: `;
    } else if (question.includes('dove')) {
        intro = `Riguardo a "${title}": `;
    } else if (question.includes('come')) {
        intro = `Per spiegare come funziona "${title}": `;
    } else if (question.includes('perché')) {
        intro = `Riguardo al motivo legato a "${title}": `;
    } else {
        intro = `Su "${title}" ho trovato questo: `;
    }
    
    // Limita il contenuto a 250-300 caratteri per una lettura fluida
    let excerpt = content.trim();
    
    // Rimuovi i paragrafi vuoti
    excerpt = excerpt.split('\n').filter(p => p.trim().length > 0).join('\n\n');
    
    // Taglia a una lunghezza ragionevole
    if (excerpt.length > 400) {
        const sentences = excerpt.split(/[.!?]+/);
        excerpt = sentences.slice(0, 2).join('. ').trim() + '.';
        if (excerpt.length > 400) {
            excerpt = excerpt.substring(0, 400) + '...';
        }
    }
    
    const response = `${intro}\n\n${excerpt}\n\n[📖 Leggi di più su Wikipedia](${url})`;
    
    return response;
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
