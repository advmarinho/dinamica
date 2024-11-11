// Letras disponíveis (20 letras, incluindo repetições)
const availableLetters = [
    'A', 'C', 'D', 'H', 'J', 'M', 'N',
    'O', 'O', 'O', 'O', 'O', 'O',
    'S', 'S', 'S', 'S',
    'T', 'T', 'U'
];

// Contagem das letras
let letterCounts = {};
availableLetters.forEach(letter => {
    if (letterCounts[letter]) {
        letterCounts[letter]++;
    } else {
        letterCounts[letter] = 1;
    }
});

// Histórico de palavras inseridas
let enteredWords = [];

// Dados da cruzadinha
const crosswordData = [
    // Cada array representa uma linha na cruzadinha
    [{ letter: 'J', wordIds: [1] }, { letter: 'U', wordIds: [1] }, { letter: 'N', wordIds: [1] }, { letter: 'T', wordIds: [1] }, { letter: 'O', wordIds: [1] }, { letter: 'S', wordIds: [1] }],
    [{ letter: 'S', wordIds: [2] }, { letter: 'O', wordIds: [2] }, { letter: 'M', wordIds: [2] }, { letter: 'O', wordIds: [2] }, { letter: 'S', wordIds: [2] }, null],
    [null, null, null, null, null, null],
    [null, null, null, null, { letter: 'T', wordIds: [3] }, null],
    [null, null, null, null, { letter: 'O', wordIds: [3] }, null],
    [null, null, null, null, { letter: 'D', wordIds: [3] }, null],
    [null, null, null, null, { letter: 'O', wordIds: [3] }, null],
    [null, null, null, null, { letter: 'S', wordIds: [3] }, null],
    [null, null, null, null, null, null],
    [{ letter: 'H', wordIds: [4] }, { letter: 'A', wordIds: [4] }, { letter: 'O', wordIds: [4] }, { letter: 'C', wordIds: [4] }, null, null],
];

// Palavras-chave
const words = {
    1: { name: 'JUNTOS', revealed: false, positions: [] },
    2: { name: 'SOMOS', revealed: false, positions: [] },
    3: { name: 'TODOS', revealed: false, positions: [] },
    4: { name: 'HAOC', revealed: false, positions: [] },
};

const crosswordContainer = document.getElementById('crossword');
const availableLettersContainer = document.getElementById('letters-list');
const hint = document.getElementById('hint');
const moral = document.getElementById('moral');
const inputWord = document.getElementById('input-word');
const submitWord = document.getElementById('submit-word');
const message = document.getElementById('message');
const historyList = document.getElementById('history-list');

let totalWords = Object.keys(words).length;
let completedWords = 0;

function createAvailableLetters() {
    availableLettersContainer.innerHTML = '';
    for (let letter in letterCounts) {
        const li = document.createElement('li');
        li.textContent = `${letter}: ${letterCounts[letter]}`;
        availableLettersContainer.appendChild(li);
    }
}

function createCrossword() {
    crosswordData.forEach((rowData, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        rowData.forEach((cellData, colIndex) => {
            const cellDiv = document.createElement('div');
            if (cellData === null) {
                cellDiv.classList.add('cell', 'empty');
            } else {
                cellDiv.classList.add('cell', 'filled');
                cellDiv.dataset.row = rowIndex;
                cellDiv.dataset.col = colIndex;
                cellDiv.dataset.wordIds = cellData.wordIds.join(',');
                cellDiv.dataset.letter = cellData.letter;
                const letterSpan = document.createElement('span');
                letterSpan.classList.add('letter');
                cellDiv.appendChild(letterSpan);

                // Armazena as posições de cada letra para cada palavra
                cellData.wordIds.forEach(wordId => {
                    if (!words[wordId].positions) {
                        words[wordId].positions = [];
                    }
                    words[wordId].positions.push(cellDiv);
                });
            }
            rowDiv.appendChild(cellDiv);
        });
        crosswordContainer.appendChild(rowDiv);
    });
}

function normalizeText(text) {
    return text
        .normalize('NFD') // Normaliza caracteres Unicode
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-zA-Z]/g, '') // Remove caracteres especiais
        .toUpperCase();
}

function checkInputWord() {
    const userWord = normalizeText(inputWord.value.trim());
    message.textContent = '';
    inputWord.value = '';

    if (!userWord) {
        message.textContent = 'Por favor, digite uma palavra.';
        return;
    }

    // Verificar se a palavra já foi inserida no histórico
    if (enteredWords.includes(userWord)) {
        message.textContent = 'Esta palavra já foi inserida.';
        return;
    }

    // Adicionar a palavra ao histórico, mesmo que não seja válida
    enteredWords.push(userWord);
    updateHistory();

    // Verificar se a palavra é uma das palavras-chave
    const validWords = Object.values(words).map(word => word.name);
    if (!validWords.includes(userWord)) {
        message.textContent = 'Palavra adicionada ao histórico, mas não é uma palavra-chave.';
        return;
    }

    // Verificar se a palavra pode ser formada com as letras disponíveis
    if (!canFormWord(userWord)) {
        message.textContent = 'A palavra não pode ser formada com as letras disponíveis.';
        return;
    }

    // Deduzir as letras usadas das letras disponíveis
    useLetters(userWord);

    // Inserir a palavra na cruzadinha
    let wordFound = false;
    for (let wordId in words) {
        if (normalizeText(words[wordId].name) === userWord && !words[wordId].revealed) {
            revealWord(wordId);
            wordFound = true;
            completedWords++;
            if (completedWords === totalWords) {
                hint.style.display = 'block';
                moral.style.display = 'block';
                moral.textContent = 'Moral da história: JUNTOS SOMOS TODOS HAOC!';
            }
            break;
        }
    }

    if (wordFound) {
        message.textContent = 'Palavra válida adicionada à cruzadinha!';
    } else {
        message.textContent = 'Palavra adicionada ao histórico, mas não é uma palavra-chave.';
    }

    // Atualizar a exibição das letras disponíveis
    createAvailableLetters();
}


function canFormWord(word) {
    const lettersCopy = { ...letterCounts };
    for (let char of word) {
        if (!lettersCopy[char] || lettersCopy[char] === 0) {
            return false;
        } else {
            lettersCopy[char]--;
        }
    }
    return true;
}

function useLetters(word) {
    for (let char of word) {
        letterCounts[char]--;
    }
}

function revealWord(wordId) {
    words[wordId].revealed = true;
    words[wordId].positions.forEach(cell => {
        cell.classList.add('revealed', 'highlighted');
        cell.querySelector('.letter').textContent = cell.dataset.letter;
    });
}

function updateHistory() {
    historyList.innerHTML = '';
    enteredWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        historyList.appendChild(li);
    });
}


const funnyMessages = {
    SANTO: "Santo de casa não faz milagre, mas às vezes faz a folha de pagamento fechar no prazo!",
    MUDO: "O colaborador que ficou 'argumentos'... depois de não entregar o atestado a tempo.",
    SOMA: "Somar esforços e dividir conquistas: o lema de Gente e Gestão.",
    SUSTO: "Susto é abrir a folha de pagamento depois do retorno de férias coletivas!",
    MATO: "Aqui era tudo mato, agora tem caminho. Obrigado, Gente e Gestão, por desbravar isso tudo!",
    DADOS: "Sem dados não temos rumo, PDCA - Panejar, Fazer, Verificar e Agir.",
    TOM: "Atenção ao tom do e-mail de Gente e Gestão. Pode ser um 'favor comparecer para assinar seu ponto'.",
    SOM: "Silêncio é o som preferido durante o fechamento da folha.",
    CHATO: "Gente e Gestão é chato? Só quando precisa pedir o mesmo atestado pela quarta vez na semana!",
    CUSTA: "Quanto custa? Custa paciência, mas o resultado compensa!",
    CUSTOS: "Reduzir custos é nosso trabalho, mas nunca economizamos na cobrança de pontos!",
    JUSTO: "Ser justo é a marca registrada de Gente e Gestão!",
    CANTO: "Gente e Gestão canta para espantar os males (mas só depois que a folha está 100%).",
    MOÇO: "Gente e Gestão é o 'moço e a moça' que resolve e que cuida da folha!",
    SONHO: "Sonhamos com gestão eficiente, e realizamos com trabalho em equipe!",
    CONTO: "Quem conta um conto, fecha o ponto com a gente!",
    TAO: "Gente e Gestão: diretamente de um reino tão, tão distante, mas sempre próximo de você.",
    TUDO: "Gente e Gestão: Em tudo damos o melhor.",
    DAMOS: "No Gente e Gestão, damos atenção, apoio e, às vezes, aquela bronca leve para ajustar o ponto."
};


function checkInputWord() {
    const userWord = normalizeText(inputWord.value.trim());
    message.textContent = '';
    inputWord.value = '';

    if (!userWord) {
        message.textContent = 'Por favor, digite uma palavra.';
        return;
    }

    // Verificar se a palavra já foi inserida no histórico
    if (enteredWords.includes(userWord)) {
        message.textContent = 'Esta palavra já foi inserida.';
        return;
    }

    // Adicionar a palavra ao histórico
    enteredWords.push(userWord);

    // Adicionar mensagem cômica se a palavra corresponder
    if (funnyMessages[userWord]) {
        enteredWords.push(funnyMessages[userWord]);
    }

    updateHistory();

    // Verificar se a palavra é uma das palavras-chave
    const validWords = Object.values(words).map(word => word.name);
    if (!validWords.includes(userWord)) {
        message.textContent = 'Palavra adicionada ao histórico, mas não é uma palavra-chave.';
        return;
    }

    // Verificar se a palavra pode ser formada com as letras disponíveis
    if (!canFormWord(userWord)) {
        message.textContent = 'A palavra não pode ser formada com as letras disponíveis.';
        return;
    }

    // Deduzir as letras usadas das letras disponíveis
    useLetters(userWord);

    // Inserir a palavra na cruzadinha
    let wordFound = false;
    for (let wordId in words) {
        if (normalizeText(words[wordId].name) === userWord && !words[wordId].revealed) {
            revealWord(wordId);
            wordFound = true;
            completedWords++;
            if (completedWords === totalWords) {
                hint.style.display = 'block';
                moral.style.display = 'block';
                moral.textContent = 'Moral da história: Juntos, colaborando, alcançamos objetivos maiores!';
            }
            break;
        }
    }

    if (wordFound) {
        message.textContent = 'Palavra válida adicionada à cruzadinha!';
    } else {
        message.textContent = 'Palavra adicionada ao histórico, mas não é uma palavra-chave.';
    }

    // Atualizar a exibição das letras disponíveis
    createAvailableLetters();
}

// Função para exibir balões e fogos
function showCelebration() {
    const balloonContainer = document.getElementById('balloons');
    const fireworkContainer = document.getElementById('fireworks');

    // Criar balões
    for (let i = 0; i < 20; i++) {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        balloon.style.left = `${Math.random() * 100}vw`;
        balloon.style.animationDelay = `${Math.random() * 2}s`;
        balloonContainer.appendChild(balloon);
    }

    // Criar fogos
    for (let i = 0; i < 30; i++) {
        const firework = document.createElement('div');
        firework.classList.add('firework');
        firework.style.top = `${Math.random() * 80}vh`;
        firework.style.left = `${Math.random() * 100}vw`;
        firework.style.animationDelay = `${Math.random() * 1}s`;
        fireworkContainer.appendChild(firework);
    }

    // Remover os efeitos após 10 segundos
    setTimeout(() => {
        balloonContainer.innerHTML = '';
        fireworkContainer.innerHTML = '';
    }, 10000);
}

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;

    const interval = setInterval(() => {
        minutes = Math.floor(timer / 60);
        seconds = timer % 60;

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        display.textContent = minutes + ':' + seconds;

        if (--timer < 0) {
            clearInterval(interval);
            display.textContent = "Tempo esgotado!";
            alert("O tempo acabou! Finalize sua cruzadinha.");
        }
    }, 1000);
}



window.onload = function () {
    const timerDisplay = document.getElementById('timer');
    const eightMinutes = 8 * 60; // 8 minutos em segundos
    startTimer(eightMinutes, timerDisplay);
};


submitWord.addEventListener('click', checkInputWord);

// Permite enviar a palavra ao pressionar "Enter"
inputWord.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        checkInputWord();
    }
});

createAvailableLetters();
createCrossword();
