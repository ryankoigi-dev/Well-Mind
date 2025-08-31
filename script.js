// Well Mind Web Application - Frontend JavaScript
class WellMindApp {
    constructor() {
        this.currentUser = null;
        this.moodData = [];
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeMoodChart();
        this.loadUserData();
        this.setupSmoothScrolling();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('login-btn').addEventListener('click', () => this.showModal('login-modal'));
        document.getElementById('get-started-btn').addEventListener('click', () => this.showModal('register-modal'));

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('login-modal');
            this.showModal('register-modal');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('register-modal');
            this.showModal('login-modal');
        });

        // Forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        // Mood tracking
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectMood(btn));
        });
        document.getElementById('save-mood').addEventListener('click', () => this.saveMoodEntry());

        // Chat
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                this.currentUser = data.user;
                this.hideModal('login-modal');
                this.updateUIForLoggedInUser();
                this.loadUserMoodData();
                this.showNotification('Welcome back!', 'success');
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Connection error. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                this.hideModal('register-modal');
                this.showNotification('Account created successfully! Please login.', 'success');
                this.showModal('login-modal');
            } else {
                this.showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Connection error. Please try again.', 'error');
        }
    }

    selectMood(selectedBtn) {
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        selectedBtn.classList.add('selected');
        this.selectedMood = selectedBtn.dataset.mood;
    }

    async saveMoodEntry() {
        if (!this.selectedMood) {
            this.showNotification('Please select a mood first', 'error');
            return;
        }

        const notes = document.getElementById('mood-notes').value;
        
        try {
            const response = await fetch('/api/mood', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mood_score: parseInt(this.selectedMood),
                    notes: notes,
                    user_id: this.currentUser?.id || 1 // Default user for demo
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('Mood entry saved!', 'success');
                document.getElementById('mood-notes').value = '';
                document.querySelectorAll('.mood-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                this.selectedMood = null;
                this.loadUserMoodData();
            } else {
                this.showNotification(data.message || 'Failed to save mood', 'error');
            }
        } catch (error) {
            console.error('Mood save error:', error);
            this.showNotification('Connection error. Please try again.', 'error');
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        input.value = '';

        // Show typing indicator
        this.addTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    user_id: this.currentUser?.id || 1
                }),
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            if (response.ok) {
                this.addMessageToChat(data.response, 'bot');
            } else {
                this.addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.addMessageToChat('Connection error. Please check your internet connection.', 'bot');
        }
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = '<div class="message-content"><div class="loading"></div> MindBot is typing...</div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    initializeMoodChart() {
        const ctx = document.getElementById('moodChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Mood Score',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const moods = ['', '😢', '😕', '😐', '🙂', '😊'];
                                return moods[value] || value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async loadUserMoodData() {
        try {
            const response = await fetch(`/api/mood/${this.currentUser?.id || 1}`);
            const data = await response.json();
            
            if (response.ok) {
                this.updateMoodChart(data.mood_entries);
            }
        } catch (error) {
            console.error('Error loading mood data:', error);
        }
    }

    updateMoodChart(moodEntries) {
        const labels = moodEntries.map(entry => {
            const date = new Date(entry.timestamp);
            return date.toLocaleDateString();
        });
        
        const data = moodEntries.map(entry => entry.mood_score);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('login-btn');
        loginBtn.textContent = `Hi, ${this.currentUser.username}`;
        loginBtn.onclick = () => this.logout();
    }

    logout() {
        this.currentUser = null;
        const loginBtn = document.getElementById('login-btn');
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => this.showModal('login-modal');
        this.showNotification('Logged out successfully', 'success');
    }

    loadUserData() {
        // Load user data from localStorage for demo purposes
        const savedUser = localStorage.getItem('wellmind_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
            this.loadUserMoodData();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '3000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WellMindApp();
});

// Demo data for testing without backend
const demoMoodData = [
    { mood_score: 3, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { mood_score: 4, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { mood_score: 2, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { mood_score: 5, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { mood_score: 4, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { mood_score: 3, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { mood_score: 4, timestamp: new Date().toISOString() }
];

// Fallback for demo mode when backend is not available
window.addEventListener('load', () => {
    setTimeout(() => {
        const app = window.wellMindApp || new WellMindApp();
        if (app.chart && app.chart.data.labels.length === 0) {
            app.updateMoodChart(demoMoodData);
        }
    }, 1000);
});