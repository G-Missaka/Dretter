const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const vowels = 'AEIOU'.split('');
let randomLetters = [];
let selectedLetters = [];
let possibleWords = [];
let enteredWords = [];
let totalPoints = 0;
let allLettersUsedBonusAwarded = false;

const letterPoints = {
    'A': 0, 'B': 3, 'C': 3, 'D': 2, 'E': 0, 'F': 4, 'G': 2, 'H': 4,
    'I': 0, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 0, 'P': 3,
    'Q': 50, 'R': 1, 'S': 0, 'T': 1, 'U': 0, 'V': 4, 'W': 4, 'X': 8,
    'Y': 4, 'Z': 30
};

document.getElementById('play-random-seed-button').addEventListener('click', playRandomSeed);
document.getElementById('play-date-seed-button').addEventListener('click', playDateSeed);
document.getElementById('set-seed-button').addEventListener('click', setSeed);
document.getElementById('submit-word-button').addEventListener('click', submitWord);
document.getElementById('finish-button').addEventListener('click', finishGame);

function playRandomSeed() {
    resetGame();
    randomLetters = generateRandomLetters();
    displayDraftLetters();
}

function playDateSeed() {
    resetGame();
    const dateSeed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    randomLetters = generateRandomLetters(dateSeed);
    displayDraftLetters();
}

function setSeed() {
    resetGame();
    const seedValue = document.getElementById('seed-input').value;
    if (isNaN(seedValue) || seedValue === '') {
        alert('Please enter a valid integer for the seed.');
        return;
    }
    randomLetters = generateRandomLetters(seedValue);
    displayDraftLetters();
}

function resetGame() {
    selectedLetters = [];
    possibleWords = [];
    enteredWords = [];
    totalPoints = 0;
    allLettersUsedBonusAwarded = false;
    document.getElementById('result').innerText = '';
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('draft-letters').innerHTML = '';
    document.getElementById('guess-letters').innerHTML = '';
    document.getElementById('guess-input').value = '';
}

function generateRandomLetters(seed = null) {
    const letters = [...alphabet];
    if (seed) {
        Math.seedrandom(seed);
    } else {
        Math.seedrandom();
    }
    const randomLetters = [];
    while (randomLetters.length < 2) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        const letter = letters.splice(randomIndex, 1)[0];
        randomLetters.push(letter);
    }
    return randomLetters;
}

function displayDraftLetters() {
    const draftLettersDiv = document.getElementById('draft-letters');
    randomLetters.forEach(letter => {
        const button = document.createElement('button');
        button.classList.add('letter-button');
        if (vowels.includes(letter)) {
            button.classList.add('vowel');
        }
        button.innerText = letter;
        button.addEventListener('click', () => selectLetter(letter));
        draftLettersDiv.appendChild(button);
    });
    document.getElementById('game-board').classList.remove('hidden');
}

function selectLetter(letter) {
    selectedLetters.push(letter);
    displaySelectedLetters();
}

function displaySelectedLetters() {
    const guessLettersDiv = document.getElementById('guess-letters');
    guessLettersDiv.innerHTML = `Selected Letters: ${selectedLetters.join(', ')}`;
}

function submitWord() {
    const word = document.getElementById('guess-input').value.trim().toUpperCase();
    if (word === '') return;
    document.getElementById('guess-input').value = '';

    if (enteredWords.includes(word)) {
        document.getElementById('result').innerText = `'${word}' has already been entered.`;
        return;
    }

    if (!isValidWord(word)) {
        document.getElementById('result').innerText = `'${word}' is not in the word list.`;
        return;
    }

    const points = calculatePoints(word);
    totalPoints += points;
    enteredWords.push(word);

    if (usesAllDraftedLetters(word)) {
        totalPoints += 200;
        document.getElementById('result').innerText = `'${word}' scores ${points} points and uses all letters. Bonus: +200 points. Total points: ${totalPoints}`;
    } else {
        document.getElementById('result').innerText = `'${word}' scores ${points} points. Total points: ${totalPoints}`;
    }

    if (!allLettersUsedBonusAwarded && usesAllDraftedLetters()) {
        totalPoints += 100;
        allLettersUsedBonusAwarded = true;
        document.getElementById('result').innerText = `Bonus: Used all letters at least once! Total points: ${totalPoints}`;
    }
}

function isValidWord(word) {
    return possibleWords.includes(word.toLowerCase());
}

function calculatePoints(word) {
    let points = 0;
    word.split('').forEach(letter => {
        points += letterPoints[letter] || 0;
    });
    if (word.endsWith('S') && possibleWords.includes(word.slice(0, -1).toLowerCase())) {
        points = Math.floor(points / 3);
    }
    return points;
}

function usesAllDraftedLetters(word) {
    const wordLetters = word.split('');
    return randomLetters.every(letter => wordLetters.includes(letter));
}

function finishGame() {
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('result').innerText = `Game finished. Total points: ${totalPoints}.`;
}

fetch('dictionary.txt')
    .then(response => response.text())
    .then(data => {
        possibleWords = data.split('\n').map(word => word.trim().toLowerCase());
    })
    .catch(error => {
        console.error('Error loading dictionary:', error);
    });
