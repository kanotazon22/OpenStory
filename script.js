// Game Logic Manager với Debug Visual
class ChoiceGameManager {
    constructor() {
        this.currentScene = null;
        this.sceneHistory = [];
        this.gameStats = {
            currentSceneNumber: 0
        };
        this.debugMode = true; // Bật debug mode
        this.initializeGame();  
    }  

    // Tạo debug overlay
    createDebugOverlay() {
        if (document.getElementById('debugOverlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'debugOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            background: rgba(0,0,0,0.9);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            overflow-y: auto;
            border: 2px solid #00ff00;
        `;
        
        overlay.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                <h3 style="color: #00ff00; margin: 0;">🔧 DEBUG MODE</h3>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="background: #ff0000; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">X</button>
            </div>
            <div id="debugContent"></div>
        `;
        
        document.body.appendChild(overlay);
    }

    // Log debug message trực tiếp lên màn hình
    debugLog(message, type = 'info') {
        if (!this.debugMode) return;
        
        this.createDebugOverlay();
        const debugContent = document.getElementById('debugContent');
        
        const colors = {
            info: '#00ff00',
            error: '#ff0000',
            warning: '#ffff00',
            success: '#00ffff'
        };
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            margin-bottom: 5px;
            padding: 5px;
            border-left: 3px solid ${colors[type]};
            background: rgba(255,255,255,0.1);
        `;
        
        logEntry.innerHTML = `<span style="color: #888;">[${timestamp}]</span> <span style="color: ${colors[type]};">${message}</span>`;
        debugContent.appendChild(logEntry);
        
        // Scroll to bottom
        debugContent.scrollTop = debugContent.scrollHeight;
        
        // Keep only last 20 entries
        while (debugContent.children.length > 20) {
            debugContent.removeChild(debugContent.firstChild);
        }
    }

    // Khởi tạo game  
    initializeGame() {  
        this.debugLog('🚀 Khởi tạo game...', 'info');
        this.bindEvents();  
        this.showStorySelection();  
        this.hideLoading();
        this.debugLog('✅ Game khởi tạo thành công', 'success');
    }  

    // Bind các sự kiện  
    bindEvents() {  
        this.debugLog('🔗 Đang bind events...', 'info');
        
        // Nút quay lại từ game screen  
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {  
                this.debugLog('👈 Click nút Back', 'info');
                this.showStorySelection();  
            });
        } else {
            this.debugLog('❌ Không tìm thấy backBtn', 'error');
        }

        // Nút chơi lại  
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {  
                this.debugLog('🔄 Click nút Play Again', 'info');
                this.restartCurrentStory();  
            });
        } else {
            this.debugLog('❌ Không tìm thấy playAgainBtn', 'error');
        }

        // Nút chọn câu chuyện khác  
        const selectStoryBtn = document.getElementById('selectStoryBtn');
        if (selectStoryBtn) {
            selectStoryBtn.addEventListener('click', () => {  
                this.debugLog('📚 Click nút Select Story', 'info');
                this.showStorySelection();  
            });
        } else {
            this.debugLog('❌ Không tìm thấy selectStoryBtn', 'error');
        }
        
        this.debugLog('✅ Events đã được bind', 'success');
    }  

    // Hiển thị màn hình chọn câu chuyện  
    showStorySelection() {  
        this.debugLog('📋 Hiển thị màn hình chọn story...', 'info');
        this.hideAllScreens();  
        const storySelection = document.getElementById('story-selection');
        if (storySelection) {
            storySelection.classList.add('active');
            this.debugLog('✅ Story selection screen đã active', 'success');
        } else {
            this.debugLog('❌ Không tìm thấy story-selection element', 'error');
        }
        this.loadAvailableStories();  
    }  

    // Load danh sách câu chuyện có sẵn  
    async loadAvailableStories() {  
        this.debugLog('📖 Bắt đầu load available stories...', 'info');
        const storyList = document.getElementById('storyList');  
        
        if (!storyList) {
            this.debugLog('❌ Không tìm thấy storyList element', 'error');
            return;
        }
          
        try {  
            // Show loading state  
            storyList.innerHTML = '<div class="loading-stories">Đang tải câu chuyện...</div>';  
            this.debugLog('⏳ Đang hiển thị loading state...', 'info');
            
            // Check if getAvailableStories function exists
            if (typeof getAvailableStories !== 'function') {
                this.debugLog('❌ Function getAvailableStories không tồn tại!', 'error');
                storyList.innerHTML = '<div class="error-stories">Lỗi: Function getAvailableStories không được định nghĩa</div>';
                return;
            }
            
            this.debugLog('🔍 Đang gọi getAvailableStories()...', 'info');
            
            // Await the async function  
            const stories = await getAvailableStories();  
            this.debugLog(`📚 Nhận được ${stories ? stories.length : 0} stories`, 'info');
            
            // Clear loading and render stories  
            storyList.innerHTML = '';  
              
            if (!stories || stories.length === 0) {  
                this.debugLog('⚠️ Không có story nào', 'warning');
                storyList.innerHTML = '<div class="no-stories">Không có câu chuyện nào được tìm thấy.</div>';  
                return;  
            }  

            this.debugLog('🎨 Đang render story cards...', 'info');
            stories.forEach((story, index) => {  
                this.debugLog(`📝 Render story ${index + 1}: ${story.title || 'No title'}`, 'info');
                const storyCard = this.createStoryCard(story);  
                storyList.appendChild(storyCard);  
            });
            
            this.debugLog('✅ Tất cả stories đã được render thành công', 'success');
        } catch (error) {  
            this.debugLog(`💥 LỖI khi load stories: ${error.message}`, 'error');
            this.debugLog(`Stack trace: ${error.stack}`, 'error');
            storyList.innerHTML = '<div class="error-stories">Có lỗi khi tải câu chuyện. Vui lòng thử lại.</div>';  
        }  
    }  

    // Tạo card cho mỗi câu chuyện  
    createStoryCard(story) {  
        this.debugLog(`🎴 Tạo card cho story: ${story.title}`, 'info');
        
        if (!story.id) {
            this.debugLog(`⚠️ Story thiếu ID: ${JSON.stringify(story)}`, 'warning');
        }
        
        const card = document.createElement('div');  
        card.className = 'story-card';  
          
        card.innerHTML = `  
            <div class="story-info">  
                <h3 class="story-title">${story.title || 'No Title'}</h3>  
                <p class="story-description">${story.description || 'No Description'}</p>  
                <div class="story-meta">  
                    <span class="story-author">Tác giả: ${story.author || 'Unknown'}</span>  
                    <span class="story-difficulty">Độ khó: ${story.difficulty || 'N/A'}</span>  
                    <span class="story-time">Thời gian: ${story.estimatedTime || 'N/A'}</span>  
                </div>  
            </div>  
        `;  

        card.addEventListener('click', () => {  
            this.debugLog(`🎯 Click vào story: ${story.title} (ID: ${story.id})`, 'info');
            this.startStory(story.id);  
        });  

        return card;  
    }  

    // Bắt đầu một câu chuyện  
    async startStory(storyId) {  
        this.debugLog(`🚀 Bắt đầu story với ID: ${storyId}`, 'info');
        this.showLoading();  
          
        try {  
            // Check if getStoryById function exists
            if (typeof getStoryById !== 'function') {
                this.debugLog('❌ Function getStoryById không tồn tại!', 'error');
                alert('Lỗi: Function getStoryById không được định nghĩa');
                this.hideLoading();
                return;
            }
            
            this.debugLog(`📖 Đang load story với ID: ${storyId}`, 'info');
            
            // Await the async function  
            const story = await getStoryById(storyId);  
            this.debugLog(`📚 Story loaded: ${story ? story.title : 'null'}`, story ? 'success' : 'error');
              
            if (!story) {  
                this.debugLog('❌ Story không tồn tại hoặc trả về null', 'error');
                alert('Câu chuyện không tồn tại!');  
                this.hideLoading();  
                return;  
            }  
            
            // Check if validateStory function exists
            if (typeof validateStory !== 'function') {
                this.debugLog('❌ Function validateStory không tồn tại!', 'error');
                alert('Lỗi: Function validateStory không được định nghĩa');
                this.hideLoading();
                return;
            }
              
            this.debugLog('🔍 Đang validate story...', 'info');
            const isValid = validateStory(story);
            this.debugLog(`✅ Story validation: ${isValid ? 'PASS' : 'FAIL'}`, isValid ? 'success' : 'error');
            
            if (!isValid) {  
                this.debugLog('❌ Story không hợp lệ!', 'error');
                alert('Câu chuyện không hợp lệ!');  
                this.hideLoading();  
                return;  
            }  

            this.currentStory = story;  
            this.sceneHistory = [];  
            this.gameStats.currentSceneNumber = 1;  
            
            this.debugLog(`✅ Story "${story.title}" loaded thành công`, 'success');
            this.debugLog(`📊 Scenes available: ${Object.keys(story.scenes || {}).join(', ')}`, 'info');
              
            // Delay nhỏ để hiển thị loading  
            setTimeout(() => {  
                this.hideLoading();  
                this.goToScene('start');  
                this.showGameScreen();  
            }, 500);  
              
        } catch (error) {  
            this.debugLog(`💥 LỖI khi load story: ${error.message}`, 'error');
            this.debugLog(`Stack trace: ${error.stack}`, 'error');
            alert('Có lỗi khi tải câu chuyện. Vui lòng thử lại.');  
            this.hideLoading();  
        }  
    }  

    // Hiển thị màn hình game  
    showGameScreen() {  
        this.debugLog('🎮 Hiển thị game screen...', 'info');
        this.hideAllScreens();  
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('active');
            this.debugLog('✅ Game screen đã active', 'success');
        } else {
            this.debugLog('❌ Không tìm thấy game-screen element', 'error');
        }
        
        const storyTitle = document.getElementById('storyTitle');
        if (storyTitle && this.currentStory) {
            storyTitle.textContent = this.currentStory.title;
            this.debugLog(`📝 Set story title: ${this.currentStory.title}`, 'info');
        } else {
            this.debugLog('⚠️ Không thể set story title', 'warning');
        }
    }  

    // Đi đến một scene cụ thể  
    goToScene(sceneId) {  
        this.debugLog(`🎬 Đi đến scene: ${sceneId}`, 'info');
        
        if (!this.currentStory || !this.currentStory.scenes) {
            this.debugLog('❌ currentStory hoặc scenes không tồn tại', 'error');
            return;
        }
        
        const scene = this.currentStory.scenes[sceneId];  
          
        if (!scene) {  
            this.debugLog(`❌ Scene "${sceneId}" không tồn tại!`, 'error');
            this.debugLog(`📋 Available scenes: ${Object.keys(this.currentStory.scenes).join(', ')}`, 'info');
            return;  
        }  

        // Lưu scene hiện tại vào history  
        if (this.currentScene) {  
            this.sceneHistory.push(this.currentScene);  
            this.debugLog(`📚 Added to history: ${this.currentScene}`, 'info');
        }  

        this.currentScene = sceneId;  
        this.updateSceneCounter();  
        this.renderScene(scene);  

        // Kiểm tra nếu đây là scene kết thúc  
        if (scene.isEnding) {  
            this.debugLog('🏁 Đây là scene kết thúc', 'info');
            this.handleEnding(scene);  
        } else {
            this.debugLog(`🎭 Scene bình thường, có ${(scene.choices || []).length} choices`, 'info');
        }
    }  

    // Render scene lên UI  
    renderScene(scene) {  
        this.debugLog('🎨 Đang render scene...', 'info');
        
        // Update scene text với animation  
        const sceneTextEl = document.getElementById('sceneText');  
        if (sceneTextEl) {
            sceneTextEl.classList.remove('animate');  
            sceneTextEl.innerHTML = this.formatText(scene.text);
            this.debugLog('📝 Scene text đã được update', 'info');
              
            // Trigger text animation  
            setTimeout(() => {  
                sceneTextEl.classList.add('animate');  
            }, 100);
        } else {
            this.debugLog('❌ Không tìm thấy sceneText element', 'error');
        }

        // Update scene image  
        this.updateSceneImage(scene);  

        // Render choices với delay animation  
        if (!scene.isEnding) {  
            this.renderChoicesWithAnimation(scene.choices || []);  
        } else {  
            const choicesContainer = document.getElementById('choicesContainer');
            if (choicesContainer) {
                choicesContainer.innerHTML = '';
                this.debugLog('🧹 Cleared choices cho ending scene', 'info');
            }
        }  

        // Scroll to top  
        const gameContent = document.querySelector('.game-content');
        if (gameContent) {
            gameContent.scrollTop = 0;
        }
        
        this.debugLog('✅ Scene render hoàn tất', 'success');
    }  

    // Thêm method mới cho việc xử lý ảnh  
    updateSceneImage(scene) {  
        const sceneImageEl = document.getElementById('sceneImage');  
        
        if (!sceneImageEl) {
            this.debugLog('⚠️ Không tìm thấy sceneImage element', 'warning');
            return;
        }
          
        if (scene.image && scene.image.trim() !== '') {  
            this.debugLog(`🖼️ Loading image: ${scene.image}`, 'info');
            // Show loading state  
            sceneImageEl.classList.add('loading');  
            sceneImageEl.innerHTML = '<div class="scene-placeholder">Đang tải ảnh...</div>';  
              
            // Create image element  
            const img = new Image();  
            img.onload = () => {  
                sceneImageEl.classList.remove('loading');  
                sceneImageEl.innerHTML = `<img src="${scene.image}" alt="Scene image" loading="lazy">`;  
                this.debugLog('✅ Image loaded thành công', 'success');
            };  
              
            img.onerror = () => {  
                sceneImageEl.classList.remove('loading');  
                sceneImageEl.innerHTML = `<div class="scene-placeholder">Hình ảnh không thể tải</div>`;  
                this.debugLog(`❌ Không thể tải ảnh: ${scene.image}`, 'error');
            };  
              
            // Start loading  
            img.src = scene.image;  
        } else {  
            // Fallback placeholder  
            sceneImageEl.classList.remove('loading');  
            sceneImageEl.innerHTML = `<div class="scene-placeholder">Scene</div>`;  
            this.debugLog('📋 Sử dụng placeholder cho scene không có ảnh', 'info');
        }  
    }  

    // Render choices với animation  
    renderChoicesWithAnimation(choices) {  
        this.debugLog(`🎯 Render ${choices.length} choices...`, 'info');
        const choicesContainer = document.getElementById('choicesContainer');  
        
        if (!choicesContainer) {
            this.debugLog('❌ Không tìm thấy choicesContainer', 'error');
            return;
        }
        
        choicesContainer.innerHTML = '';  

        choices.forEach((choice, index) => {  
            this.debugLog(`➡️ Choice ${index + 1}: ${choice.text} → ${choice.nextScene}`, 'info');
            const choiceBtn = document.createElement('button');  
            choiceBtn.className = 'choice-btn';  
            choiceBtn.innerHTML = `  
                <span class="choice-number">${index + 1}</span>  
                <span class="choice-text">${choice.text}</span>  
            `;  

            choiceBtn.addEventListener('click', () => {  
                this.debugLog(`🎯 Click choice: ${choice.text}`, 'info');
                this.makeChoice(choice);  
            });  

            choicesContainer.appendChild(choiceBtn);  
        });
        
        this.debugLog('✅ Tất cả choices đã được render', 'success');
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
        this.debugLog(`⚡ Making choice → ${choice.nextScene}`, 'info');
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
        this.debugLog('🏆 Xử lý ending scene...', 'info');
        setTimeout(() => {  
            this.showEndingScreen(scene);  
        }, 1500); // Delay để player đọc text cuối  
    }  

    // Hiển thị màn hình kết thúc  
    showEndingScreen(scene) {  
        this.debugLog('🎊 Hiển thị ending screen', 'info');
        this.hideAllScreens();  
        const endingScreen = document.getElementById('ending-screen');
        if (endingScreen) {
            endingScreen.classList.add('active');
        } else {
            this.debugLog('❌ Không tìm thấy ending-screen element', 'error');
        }

        // Set ending content - no emoji logic  
        const endingTitles = {  
            'success': 'Thành công!',  
            'neutral': 'Hoàn thành',  
            'bad': 'Kết thúc'  
        };  

        const endingTitle = document.getElementById('endingTitle');
        const endingText = document.getElementById('endingText');
        
        if (endingTitle) {
            endingTitle.textContent = scene.endingTitle || endingTitles[scene.endingType] || 'Kết thúc';
        }
        
        if (endingText) {
            endingText.innerHTML = this.formatText(scene.text);
        }
        
        this.debugLog('✅ Ending screen setup hoàn tất', 'success');
    }  

    // Restart câu chuyện hiện tại  
    restartCurrentStory() {  
        this.debugLog('🔄 Restart current story', 'info');
        if (this.currentStory) {  
            this.sceneHistory = [];  
            this.gameStats.currentSceneNumber = 1;  
            this.goToScene('start');  
            this.showGameScreen();  
        } else {
            this.debugLog('⚠️ Không có current story để restart', 'warning');
        }
    }  

    // Update scene counter  
    updateSceneCounter() {  
        const counter = document.getElementById('sceneCounter');  
        if (counter) {
            counter.textContent = `Scene ${this.gameStats.currentSceneNumber}`;
            this.debugLog(`📊 Scene counter: ${this.gameStats.currentSceneNumber}`, 'info');
        } else {
            this.debugLog('⚠️ Không tìm thấy sceneCounter element', 'warning');
        }
    }  

    // Utility functions  
    hideAllScreens() {  
        this.debugLog('🙈 Hide all screens', 'info');
        const screens = document.querySelectorAll('.screen');
        this.debugLog(`📱 Tìm thấy ${screens.length} screens`, 'info');
        screens.forEach(screen => {  
            screen.classList.remove('active');  
        });  
    }  

    showLoading() {  
        this.debugLog('⏳ Show loading overlay', 'info');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        } else {
            this.debugLog('❌ Không tìm thấy loadingOverlay element', 'error');
        }
    }  

    hideLoading() {  
        this.debugLog('✅ Hide loading overlay', 'info');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        } else {
            this.debugLog('❌ Không tìm thấy loadingOverlay element', 'error');
        }
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
            this.debugLog(`❌ Scene "${sceneId}" không tồn tại trong story hiện tại`, 'error');
        }  
    }

    // Toggle debug mode
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        const overlay = document.getElementById('debugOverlay');
        if (overlay) {
            overlay.style.display = this.debugMode ? 'block' : 'none';
        }
        console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
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
        validateStory: (storyId) => validateStory(getStoryById(storyId)),
        toggleDebug: () => window.gameManager.toggleDebugMode(),
        log: (msg, type) => window.gameManager.debugLog(msg, type)
    };

    // Add debug toggle hotkey (Ctrl + D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            window.gameManager.toggleDebugMode();
        }
    });

    console.log('🔧 Debug Mode Active - Press Ctrl+D to toggle debug panel');
    console.log('🎮 Use window.debugGame object for manual debugging');
});

// Handle back button behavior
window.addEventListener('popstate', (event) => {
    if (window.gameManager) {
        window.gameManager.showStorySelection();
    }
});