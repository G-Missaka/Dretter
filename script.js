document.addEventListener('DOMContentLoaded', () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const vowels = 'AEIOU'.split('');
    let randomLetters = [];
    let selectedLetters = [];
    let possibleWords = [];
    let enteredWords = [];
    let totalPoints = 0;
    let allLettersUsedBonusAwarded = false;
    let currentGroupIndex = 0;
    const groups = [];
    let gameFinished = false;
    let wordCount = 0; // Word counter

    const letterPoints = {
        'A': 0, 'B': 3, 'C': 3, 'D': 2, 'E': 0, 'F': 4, 'G': 2, 'H': 4,
        'I': 0, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 0, 'P': 3,
        'Q': 50, 'R': 1, 'S': 0, 'T': 1, 'U': 0, 'V': 4, 'W': 4, 'X': 8,
        'Y': 4, 'Z': 30
    };

    // Event listeners for game controls
    document.getElementById('play-random-seed-button').addEventListener('click', playRandomSeed);
    document.getElementById('play-date-seed-button').addEventListener('click', playDateSeed);
    document.getElementById('set-seed-button').addEventListener('click', setSeed);
    document.getElementById('finish-button').addEventListener('click', finishGame);

    // Fetch dictionary data and start the game
    fetch('dictionary.txt')
        .then(response => response.text())
        .then(data => {
            possibleWords = data.split('\n').map(word => word.trim().toLowerCase());
            // Enable game controls after loading dictionary
            enableGameControls();
        })
        .catch(error => {
            console.error('Error loading dictionary:', error);
            displayAnnouncement('Error loading dictionary. Please try again later.');
        });

    // Enable game controls once dictionary is loaded
    function enableGameControls() {
        document.getElementById('play-random-seed-button').disabled = false;
        document.getElementById('play-date-seed-button').disabled = false;
        document.getElementById('set-seed-button').disabled = false;
    }

    function playRandomSeed() {
        resetGame();
        randomLetters = generateRandomLetters();
        prepareGroups();
        showNextGroup();
        showGameButtons(); // Show submit and finish buttons after starting the game
    }

    function playDateSeed() {
        resetGame();
        const dateSeed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        randomLetters = generateRandomLetters(dateSeed);
        prepareGroups();
        showNextGroup();
        showGameButtons(); // Show submit and finish buttons after starting the game
    }

    function setSeed() {
        resetGame();
        const seedValue = document.getElementById('seed-input').value;
        if (isNaN(seedValue) || seedValue === '') {
            displayAnnouncement('Please enter a valid integer for the seed.');
            return;
        }
        randomLetters = generateRandomLetters(seedValue);
        prepareGroups();
        showNextGroup();
        showGameButtons(); // Show submit and finish buttons after starting the game
    }

    function resetGame() {
        selectedLetters = [];
        enteredWords = [];
        totalPoints = 0;
        allLettersUsedBonusAwarded = false;
        currentGroupIndex = 0;
        gameFinished = false;
        wordCount = 0; // Reset word counter
        updateWordCount(); // Update UI to show word count
        document.getElementById('result').innerText = '';
        document.getElementById('announcement').innerText = '';
        document.getElementById('missed-words').innerText = '';
        document.getElementById('game-board').classList.add('hidden');
        document.getElementById('draft-letters').innerHTML = '';
        document.getElementById('guess-letters').innerHTML = '';
        document.getElementById('guess-input').value = '';
        document.getElementById('guess-input').disabled = false;
        document.getElementById('submit-word-button').disabled = false;
        hideGameButtons(); // Hide submit and finish buttons initially
    }

    function generateRandomLetters(seed = null) {
        const letters = [...alphabet];
        if (seed) {
            Math.seedrandom(seed);
        } else {
            Math.seedrandom();
        }
        const randomLetters = [];
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * letters.length);
            const letter = letters.splice(randomIndex, 1)[0];
            randomLetters.push(letter);
        }
        return randomLetters;
    }

    function prepareGroups() {
        const remainingLetters = alphabet.filter(letter => !randomLetters.includes(letter));
        remainingLetters.sort(() => Math.random() - 0.5);
        for (let i = 0; i < 4; i++) {
            groups[i] = remainingLetters.slice(i * 5, (i + 1) * 5); // Slices into 4 groups of 5 letters each
        }
        selectedLetters = [...randomLetters];
    }

    function showNextGroup() {
        if (currentGroupIndex < groups.length) {
            const group = groups[currentGroupIndex];
            currentGroupIndex++;
            const draftLettersDiv = document.getElementById('draft-letters');
            draftLettersDiv.innerHTML = ''; // Clear previous group
    
            // Display selected letters
            displaySelectedLetters();
    
            // Display draft letters
            group.forEach(letter => {
                const button = document.createElement('button');
                button.classList.add('letter-button');
                if (vowels.includes(letter)) {
                    button.classList.add('vowel');
                }
                button.innerText = letter;
                button.addEventListener('click', () => selectLetter(letter, button));
                draftLettersDiv.appendChild(button);
            });
    
            document.getElementById('game-board').classList.remove('hidden');
        } else {
            finishLetterSelection();
        }
    }

    function selectLetter(letter, button) {
        selectedLetters.push(letter);
        button.disabled = true;
        displaySelectedLetters();
        // Check if there are more groups to show
        if (currentGroupIndex < groups.length) {
            showNextGroup();
        } else {
            finishLetterSelection();
        }
    }
    
    function displaySelectedLetters() {
        const guessLettersDiv = document.getElementById('guess-letters');
        guessLettersDiv.innerHTML = `Selected Letters: ${selectedLetters.join(', ')}`;
    }

    function finishLetterSelection() {
        document.getElementById('draft-letters').innerHTML = '';
        possibleWords = checked(selectedLetters);
        document.getElementById('result').innerText = `Number of possible words: ${possibleWords.length}`;
        displayAnnouncement('Only 5-letter (or more) words are allowed.');
    }

    function submitWord() {
        if (gameFinished) return;

        const word = document.getElementById('guess-input').value.trim().toLowerCase();

        if (word === '') return;
        document.getElementById('guess-input').value = '';

        if (enteredWords.includes(word)) {
            document.getElementById('result').innerText = `'${word}' has already been entered.`;
            return;
        }

        if (!isValidWord(word)) {
            document.getElementById('result').innerText = `'${word}' is not in the word list or does not use the selected letters.`;
            return;
        }

        const points = calculatePoints(word);
        totalPoints += points;
        enteredWords.push(word);
        wordCount++; // Increment word counter
        updateWordCount(); // Update UI to show word count

        if (usesAllDraftedLetters(word)) {
            totalPoints += 200;
            document.getElementById('result').innerText = `'${word}' scores ${points} points and uses all letters. Bonus: +200 points. Total points: ${totalPoints}`;
        } else {
            document.getElementById('result').innerText = `'${word}' scores ${points} points. Total points: ${totalPoints}`;
        }

        if (!allLettersUsedBonusAwarded && checkAllLettersUsed()) {
            totalPoints += 100;
            allLettersUsedBonusAwarded = true;
            document.getElementById('result').innerText = `Bonus: Used all letters at least once! Total points: ${totalPoints}`;
        }
    }

    function isValidWord(word) {
        const selectedSet = new Set(selectedLetters.map(letter => letter.toLowerCase()));
        return possibleWords.includes(word) && word.split('').every(letter => selectedSet.has(letter));
    }

    function calculatePoints(word) {
        let points = 0;
        word.split('').forEach(letter => {
            points += letterPoints[letter.toUpperCase()] || 0;
        });
        if (word.endsWith('s') && possibleWords.includes(word.slice(0, -1))) {
            points = Math.floor(points / 3);
        }
        return points;
    }

    function usesAllDraftedLetters(word) {
        const wordLetters = new Set(word.split(''));
        return selectedLetters.every(letter => wordLetters.has(letter.toLowerCase()));
    }

    function checkAllLettersUsed() {
        const allUsedLetters = new Set();
        enteredWords.forEach(word => {
            word.split('').forEach(letter => allUsedLetters.add(letter.toLowerCase()));
        });
        return selectedLetters.every(letter => allUsedLetters.has(letter.toLowerCase()));
    }

    function finishGame() {
        gameFinished = true;
        document.getElementById('guess-input').disabled = true;
        document.getElementById('submit-word-button').disabled = true;
        document.getElementById('game-board').classList.add('hidden');
        const missedWords = possibleWords.filter(word => !enteredWords.includes(word));
        const missedPoints = calculateMissedPoints(missedWords);
        document.getElementById('result').innerText = `Game finished. Total points: ${totalPoints}. Missed points if all words submitted: ${missedPoints}`;
        displayMissedWords(missedWords);
    }

    function checked(letters) {
        const selectedSet = new Set(letters.map(letter => letter.toLowerCase()));
        return possibleWords.filter(word => {
            if (word.length < 5) {
                return false;
            }
            const wordLetters = word.split('');
            return wordLetters.every(letter => selectedSet.has(letter.toLowerCase()));
        });
    }

    function displayAnnouncement(message) {
        document.getElementById('announcement').innerText = message;
    }

    function displayMissedWords(words) {
        document.getElementById('missed-words').innerText = `Missed words: ${words.join(', ')}`;
    }

    function updateWordCount() {
        document.getElementById('word-count').innerText = `Words: ${wordCount} / ${possibleWords.length}`;
    }

    function hideGameButtons() {
        document.getElementById('submit-word-button').style.display = 'none';
        document.getElementById('finish-button').style.display = 'none';
    }

    function showGameButtons() {
        document.getElementById('submit-word-button').style.display = 'inline-block';
        document.getElementById('finish-button').style.display = 'inline-block';
    }

    // Event listener for submitting a word with Enter key
    document.getElementById('guess-input').addEventListener('keydown', event => {
        if (event.keyCode === 13) { // Enter key
            submitWord();
        }
    });

    // Event listener for drafting a letter with keyboard equivalent
    document.addEventListener('keydown', event => {
        const key = event.key.toUpperCase();
        if (alphabet.includes(key)) {
            const button = document.querySelector(`.letter-button:not([disabled])[data-letter="${key}"]`);
            if (button) {
                button.click();
            }
        }
    });
});
