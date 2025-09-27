// Game Logic Manager (No Emoji Logic, No Progress Bar)
class ChoiceGameManager {
    constructor() {
        this.currentScene = null;
        this.sceneHistory = [];
        this.gameStats = {
            currentSceneNumber: 0
        };
        
        this.initializeGame();
    }

    // Khởi tạo game
    initializeGame() {
        this.bindEvents();
        this.showStorySelection();
        this.hideLoading();
    }

    // Bind các sự kiện
    bindEvents() {
        // Nút quay lại từ game screen
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showStorySelection();
        });

        // Nút chơi lại
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartCurrentStory();
        });

        // Nút chọn câu chuyện khác
        document.getElementById('selectStoryBtn').addEventListener('click', () => {
            this.showStorySelection();
        });
    }

    // Hiển thị màn hình chọn câu chuyện
    showStorySelection() {
        this.hideAllScreens();
        document.getElementById('story-selection').classList.add('active');
        this.loadAvailableStories();
    }

    // Load danh sách câu chuyện có sẵn
    async loadAvailableStories() {
        const storyList = document.getElementById('storyList');
        
        try {
            // Show loading state
            storyList.innerHTML = '<div class="loading-stories">Đang tải câu chuyện...</div>';
            
            // Await the async function
            const stories = await getAvailableStories();
            
            // Clear loading and render stories
            storyList.innerHTML = '';
            
            if (stories.length === 0) {
                storyList.innerHTML = '<div class="no-stories">Không có câu chuyện nào được tìm thấy.</div>';
                return;
            }

            stories.forEach(story => {
                const storyCard = this.createStoryCard(story);
                storyList.appendChild(storyCard);
            });
        } catch (error) {
            console.error('Lỗi khi load stories:', error);
            storyList.innerHTML = '<div class="error-stories">Có lỗi khi tải câu chuyện. Vui lòng thử lại.</div>';
        }
    }

    // Tạo card cho mỗi câu chuyện
    createStoryCard(story) {
        const card = document.createElement('div');
        card.className = 'story-card';
        
        card.innerHTML = `
            <div class="story-info">
                <h3 class="story-title">${story.title}</h3>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                    <span class="story-author">Tác giả: ${story.author}</span>
                    <span class="story-difficulty">Độ khó: ${story.difficulty}</span>
                    <span class="story-time">Thời gian: ${story.estimatedTime}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.startStory(story.id);
        });

        return card;
    }

    // Bắt đầu một câu chuyện
    async startStory(storyId) {
        this.showLoading();
        
        try {
            console.log(`Starting story: ${storyId}`);
            
            // Await the async function
            const story = await getStoryById(storyId);
            console.log(`Story loaded:`, story);
            
            if (!story) {
                alert('Câu chuyện không tồn tại!');
                this.hideLoading();
                return;
            }
            
            if (!validateStory(story)) {
                alert('Câu chuyện không hợp lệ!');
                this.hideLoading();
                return;
            }

            this.currentStory = story;
            this.sceneHistory = [];
            this.gameStats.currentSceneNumber = 1;
            
            console.log(`Story "${story.title}" loaded successfully`);
            
            // Delay nhỏ để hiển thị loading
            setTimeout(() => {
                this.hideLoading();
                this.goToScene('start');
                this.showGameScreen();
            }, 500);
            
        } catch (error) {
            console.error('Error loading story:', error);
            alert('Có lỗi khi tải câu chuyện. Vui lòng thử lại.');
            this.hideLoading();
        }
    }

    // Hiển thị màn hình game
    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
        document.getElementById('storyTitle').textContent = this.currentStory.title;
    }

    // Đi đến một scene cụ thể
    goToScene(sceneId) {
        const scene = this.currentStory.scenes[sceneId];
        
        if (!scene) {
            console.error(`Scene "${sceneId}" không tồn tại!`);
            return;
        }

        // Lưu scene hiện tại vào history
        if (this.currentScene) {
            this.sceneHistory.push(this.currentScene);
        }

        this.currentScene = sceneId;
        this.updateSceneCounter();
        this.renderScene(scene);

        // Kiểm tra nếu đây là scene kết thúc
        if (scene.isEnding) {
            this.handleEnding(scene);
        }
    }

    // Render scene lên UI
    renderScene(scene) {
        // Update scene text với animation
        const sceneTextEl = document.getElementById('sceneText');
        sceneTextEl.classList.remove('animate');
        sceneTextEl.innerHTML = this.formatText(scene.text);
        
        // Trigger text animation
        setTimeout(() => {
            sceneTextEl.classList.add('animate');
        }, 100);

        // Update scene image
        this.updateSceneImage(scene);

        // Render choices với delay animation
        if (!scene.isEnding) {
            this.renderChoicesWithAnimation(scene.choices || []);
        } else {
            document.getElementById('choicesContainer').innerHTML = '';
        }

        // Scroll to top
        document.querySelector('.game-content').scrollTop = 0;
    }

    // Thêm method mới cho việc xử lý ảnh
    updateSceneImage(scene) {
        const sceneImageEl = document.getElementById('sceneImage');
        
        if (scene.image && scene.image.trim() !== '') {
            // Show loading state
            sceneImageEl.classList.add('loading');
            sceneImageEl.innerHTML = '<div class="scene-placeholder">Đang tải ảnh...</div>';
            
            // Create image element
            const img = new Image();
            img.onload = () => {
                sceneImageEl.classList.remove('loading');
                sceneImageEl.innerHTML = `<img src="${scene.image}" alt="Scene image" loading="lazy">`;
            };
            
            img.onerror = () => {
                sceneImageEl.classList.remove('loading');
                sceneImageEl.innerHTML = `<div class="scene-placeholder">Hình ảnh không thể tải</div>`;
                console.warn(`Không thể tải ảnh: ${scene.image}`);
            };
            
            // Start loading
            img.src = scene.image;
        } else {
            // Fallback placeholder
            sceneImageEl.classList.remove('loading');
            sceneImageEl.innerHTML = `<div class="scene-placeholder">Scene</div>`;
        }
    }

    // Render choices với animation
    renderChoicesWithAnimation(choices) {
        const choicesContainer = document.getElementById('choicesContainer');
        choicesContainer.innerHTML = '';

        choices.forEach((choice, index) => {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'choice-btn';
            choiceBtn.innerHTML = `
                <span class="choice-number">${index + 1}</span>
                <span class="choice-text">${choice.text}</span>
            `;

            choiceBtn.addEventListener('click', () => {
                this.makeChoice(choice);
            });

            choicesContainer.appendChild(choiceBtn);
        });
    }

    // Format text với các tag đặc biệt
    formatText(text) {
        // Format text với các tag đặc biệt như *bold*, _italic_, etc.
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Xử lý khi player chọn một lựa chọn
    makeChoice(choice) {
        // Add animation effect
        const choiceBtns = document.querySelectorAll('.choice-btn');
        choiceBtns.forEach(btn => btn.disabled = true);

        // Delay nhỏ để tạo hiệu ứng
        setTimeout(() => {
            this.gameStats.currentSceneNumber++;
            this.goToScene(choice.nextScene);
            
            // Re-enable buttons (sẽ bị thay thế bởi scene mới)
            choiceBtns.forEach(btn => btn.disabled = false);
        }, 200);
    }

    // Xử lý khi đến scene kết thúc
    handleEnding(scene) {
        setTimeout(() => {
            this.showEndingScreen(scene);
        }, 1500); // Delay để player đọc text cuối
    }

    // Hiển thị màn hình kết thúc
    showEndingScreen(scene) {
        this.hideAllScreens();
        document.getElementById('ending-screen').classList.add('active');

        // Set ending content - no emoji logic
        const endingTitles = {
            'success': 'Thành công!',
            'neutral': 'Hoàn thành',
            'bad': 'Kết thúc'
        };

        document.getElementById('endingTitle').textContent = scene.endingTitle || endingTitles[scene.endingType] || 'Kết thúc';
        document.getElementById('endingText').innerHTML = this.formatText(scene.text);
    }

    // Restart câu chuyện hiện tại
    restartCurrentStory() {
        if (this.currentStory) {
            this.sceneHistory = [];
            this.gameStats.currentSceneNumber = 1;
            this.goToScene('start');
            this.showGameScreen();
        }
    }

    // Update scene counter
    updateSceneCounter() {
        const counter = document.getElementById('sceneCounter');
        counter.textContent = `Scene ${this.gameStats.currentSceneNumber}`;
    }

    // Utility functions
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    // Debug functions
    getCurrentGameState() {
        return {
            currentStory: this.currentStory?.title,
            currentScene: this.currentScene,
            sceneHistory: this.sceneHistory,
            stats: this.gameStats
        };
    }

    // Cheat function để đi đến scene bất kỳ (chỉ dùng để debug)
    debugGoToScene(sceneId) {
        if (this.currentStory && this.currentStory.scenes[sceneId]) {
            this.goToScene(sceneId);
        } else {
            console.error(`Scene "${sceneId}" không tồn tại trong story hiện tại`);
        }
    }
}

// Khởi tạo game khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new ChoiceGameManager();
    
    // Expose some functions to global scope for debugging
    window.debugGame = {
        getState: () => window.gameManager.getCurrentGameState(),
        goToScene: (sceneId) => window.gameManager.debugGoToScene(sceneId),
        getStories: () => getAvailableStories(),
        validateStory: (storyId) => validateStory(getStoryById(storyId))
    };
});

// Handle back button behavior
window.addEventListener('popstate', (event) => {
    if (window.gameManager) {
        window.gameManager.showStorySelection();
    }
});
