// stories.js - Reworked to load from JSON files (No Emoji Logic)

class StoryManager {
    constructor() {
        this.loadedStories = new Map();
        this.availableStoryFiles = [
        ];
        this.loadingPromises = new Map();
    }

    // Thêm story file vào danh sách
    addStoryFile(filename) {
        if (!this.availableStoryFiles.includes(filename)) {
            this.availableStoryFiles.push(filename);
        }
    }

    // Load một story từ file JSON
    async loadStory(filename) {
        // Nếu đang load thì return promise đó
        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }

        // Nếu đã load rồi thì return luôn
        if (this.loadedStories.has(filename)) {
            return this.loadedStories.get(filename);
        }

        // Tạo promise để load
        const loadPromise = this._fetchStory(filename);
        this.loadingPromises.set(filename, loadPromise);

        try {
            const story = await loadPromise;
            this.loadedStories.set(filename, story);
            this.loadingPromises.delete(filename);
            return story;
        } catch (error) {
            this.loadingPromises.delete(filename);
            console.error(`Lỗi khi load story "${filename}":`, error);
            throw error;
        }
    }

    // Fetch story từ file
    async _fetchStory(filename) {
        try {
            const response = await fetch(`stories/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const story = await response.json();
            
            // Validate story
            if (!this.validateStory(story)) {
                throw new Error(`Story "${filename}" không hợp lệ`);
            }

            return {
                id: filename.replace('.json', ''),
                filename: filename,
                ...story
            };
        } catch (error) {
            throw new Error(`Không thể load story "${filename}": ${error.message}`);
        }
    }

    // Load tất cả stories có sẵn
    async loadAllStories() {
        const loadPromises = this.availableStoryFiles.map(filename => 
            this.loadStory(filename).catch(error => {
                console.warn(`Bỏ qua story "${filename}":`, error.message);
                return null;
            })
        );

        const results = await Promise.all(loadPromises);
        return results.filter(story => story !== null);
    }

    // Load chỉ metadata của stories (để hiển thị trong danh sách)
    async loadStoriesMetadata() {
        const stories = await this.loadAllStories();
        return stories.map(story => ({
            id: story.id,
            filename: story.filename,
            title: story.title,
            description: story.description,
            author: story.author,
            difficulty: story.difficulty,
            estimatedTime: story.estimatedTime
        }));
    }

    // Get story theo ID (đã load)
    getStoryById(id) {
        for (const [filename, story] of this.loadedStories) {
            if (story.id === id || filename.replace('.json', '') === id) {
                return story;
            }
        }
        return null;
    }

    // Get story theo filename (đã load)
    getStoryByFilename(filename) {
        return this.loadedStories.get(filename) || null;
    }

    // Kiểm tra story có hợp lệ không
    validateStory(story) {
        // Kiểm tra các trường bắt buộc
        if (!story || !story.scenes || !story.title) {
            console.error('Story thiếu thông tin cơ bản');
            return false;
        }

        // Kiểm tra có scene start không
        if (!story.scenes.start) {
            console.error('Story thiếu scene "start"');
            return false;
        }

        // Kiểm tra tính liên kết của các scene
        const sceneIds = Object.keys(story.scenes);
        for (const [sceneId, scene] of Object.entries(story.scenes)) {
            if (scene.choices && !scene.isEnding) {
                for (const choice of scene.choices) {
                    if (!sceneIds.includes(choice.nextScene)) {
                        console.error(`Scene "${sceneId}" có choice dẫn đến scene không tồn tại: "${choice.nextScene}"`);
                        return false;
                    }
                }
            }
        }

        // Kiểm tra có ít nhất một scene kết thúc
        const hasEnding = Object.values(story.scenes).some(scene => scene.isEnding);
        if (!hasEnding) {
            console.error('Story không có scene kết thúc nào');
            return false;
        }

        return true;
    }

    // Auto-detect story files từ thư mục stories
    async autoDetectStoryFiles() {
        try {
            // Thử load một file index.json chứa danh sách stories
            const response = await fetch('stories/index.json');
            if (response.ok) {
                const index = await response.json();
                if (Array.isArray(index.stories)) {
                    this.availableStoryFiles = index.stories;
                    return true;
                }
            }
        } catch (error) {
            console.log('Không tìm thấy stories/index.json, sử dụng danh sách mặc định');
        }

        return false;
    }

    // Tạo file index.json (utility function)
    generateIndexFile() {
        const indexContent = {
            stories: this.availableStoryFiles,
            lastUpdated: new Date().toISOString()
        };
        
        console.log('Nội dung file stories/index.json:');
        console.log(JSON.stringify(indexContent, null, 2));
        
        return indexContent;
    }

    // Clear cache
    clearCache() {
        this.loadedStories.clear();
        this.loadingPromises.clear();
    }

    // Get thống kê
    getStats() {
        return {
            availableFiles: this.availableStoryFiles.length,
            loadedStories: this.loadedStories.size,
            loadingStories: this.loadingPromises.size
        };
    }
}

// Singleton instance
const storyManager = new StoryManager();

// ====== EXPORTED FUNCTIONS (tương thích với code cũ) ======

async function getAvailableStories() {
    try {
        // Thử auto-detect trước
        await storyManager.autoDetectStoryFiles();
        
        // Load metadata của tất cả stories
        const stories = await storyManager.loadStoriesMetadata();
        
        return stories;
    } catch (error) {
        console.error('Lỗi khi load danh sách stories:', error);
        return [];
    }
}

async function getStoryById(id) {
    try {
        // Kiểm tra trong cache trước
        let story = storyManager.getStoryById(id);
        if (story) {
            return story;
        }

        // Thử load từ file
        const filename = `${id}.json`;
        story = await storyManager.loadStory(filename);
        
        return story;
    } catch (error) {
        console.error(`Lỗi khi load story "${id}":`, error);
        return null;
    }
}

function validateStory(story) {
    return storyManager.validateStory(story);
}

// ====== UTILITY FUNCTIONS ======

// Preload stories quan trọng
async function preloadStories(storyIds = []) {
    const loadPromises = storyIds.map(id => 
        getStoryById(id).catch(error => {
            console.warn(`Không thể preload story "${id}":`, error);
            return null;
        })
    );
    
    const results = await Promise.all(loadPromises);
    return results.filter(story => story !== null);
}

// Add story file programmatically
function addStoryFile(filename) {
    storyManager.addStoryFile(filename);
}

// Reload all stories
async function reloadAllStories() {
    storyManager.clearCache();
    return await getAvailableStories();
}

// ====== DEVELOPMENT HELPERS ======

// Debug function để xem stats
function getStoryManagerStats() {
    return {
        ...storyManager.getStats(),
        availableFiles: storyManager.availableStoryFiles,
        loadedStoryIds: Array.from(storyManager.loadedStories.keys())
    };
}

// Generate index.json content
function generateStoryIndex() {
    return storyManager.generateIndexFile();
}

// ====== EXPORTS ======
// Export các functions để sử dụng ở nơi khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAvailableStories,
        getStoryById,
        validateStory,
        preloadStories,
        addStoryFile,
        reloadAllStories,
        getStoryManagerStats,
        generateStoryIndex,
        storyManager
    };
}

// ====== AUTO-INITIALIZATION ======
// Auto-detect stories khi load trang
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await storyManager.autoDetectStoryFiles();
        console.log('Story manager initialized:', getStoryManagerStats());
    } catch (error) {
        console.warn('Story manager initialization warning:', error);
    }
});

// ====== BACKWARD COMPATIBILITY ======
// Để tương thích với code cũ, ta giữ lại cấu trúc STORIES cũ (nếu cần)
const LEGACY_STORIES = {
    // Có thể để trống hoặc thêm stories mặc định
};

// Legacy function (deprecated)
function getLegacyStories() {
    console.warn('getLegacyStories() is deprecated. Use getAvailableStories() instead.');
    return LEGACY_STORIES;
}
