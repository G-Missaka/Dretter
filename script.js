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
        if (possibleWords.length > 0) {
            randomLetters = generateRandomLetters();
            prepareGroups();
            showNextGroup();
        } else {
            alert('Dictionary is still loading. Please try again shortly.');
        }
    }

    function playDateSeed() {
        resetGame();
        if (possibleWords.length > 0) {
            const dateSeed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            randomLetters = generateRandomLetters(dateSeed);
            prepareGroups();
            showNextGroup();
        } else {
            alert('Dictionary is still loading. Please try again shortly.');
        }
    }

    function setSeed() {
        resetGame();
        if (possibleWords.length > 0) {
            const seedValue = document.getElementById('seed-input').value;
            if (isNaN(seedValue) || seedValue === '') {
                alert('Please enter a valid integer for the seed.');
                return;
            }
            randomLetters = generateRandomLetters(seedValue);
            prepareGroups();
            showNextGroup();
        } else {
            alert('Dictionary is still loading. Please try again shortly.');
        }
    }

    function resetGame() {
        selectedLetters = [];
        enteredWords = [];
        totalPoints = 0;
        allLettersUsedBonusAwarded = false;
        currentGroupIndex = 0;
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
    }

    function submitWord() {
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
            word.split('').forEach(letter => {
                allUsedLetters.add(letter);
            });
        });
        return selectedLetters.every(letter => allUsedLetters.has(letter.toLowerCase()));
    }

    function finishGame() {
        document.getElementById('game-board').classList.add('hidden');
        document.getElementById('result').innerText = `Game finished. Total points: ${totalPoints}.`;
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

    fetch('dictionary.txt')
        .then(response => response.text())
        .then(data => {
            possibleWords = data.split('\n').map(word => word.trim().toLowerCase());
        })
        .catch(error => {
            console.error('Error loading dictionary:', error);
        });
});
