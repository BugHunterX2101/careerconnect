// Quiz functionality
class SkillQuiz {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentQuiz = null;
        this.init();
    }

    async init() {
        await this.loadRandomQuiz();
        this.attachEventListeners();
    }

    async loadRandomQuiz() {
        try {
            const response = await fetch('http://localhost:3000/quiz/random');
            const quiz = await response.json();
            this.currentQuiz = quiz;
            this.renderQuiz(quiz);
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    }

    renderQuiz(quiz) {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = `
            <div class="quiz-question">
                <h3>${quiz.question}</h3>
                <div class="options">
                    ${quiz.options.map((option, index) => `
                        <button class="option-btn" data-index="${index}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async submitAnswer(answerIndex) {
        try {
            const response = await fetch('http://localhost:3000/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    quizId: this.currentQuiz._id,
                    answer: answerIndex
                })
            });
            const result = await response.json();
            this.showResult(result);
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    }

    showResult(result) {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML += `
            <div class="quiz-result ${result.isCorrect ? 'correct' : 'incorrect'}">
                <h4>${result.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                <p>${result.explanation}</p>
                <button onclick="quiz.loadRandomQuiz()">Next Question</button>
            </div>
        `;
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                const answerIndex = parseInt(e.target.dataset.index);
                this.submitAnswer(answerIndex);
            }
        });
    }
} 