// E-commerce Product Recommender - Main Application Logic

// Sample data from the provided JSON
const PRODUCTS = [
    {
        product_id: "P001",
        name: "Wireless Bluetooth Headphones",
        category: "Electronics",
        price: 79.99,
        rating: 4.5,
        description: "High-quality wireless headphones with noise cancellation",
        brand: "TechBrand",
        in_stock: true,
        features: ["wireless", "noise-cancellation", "bluetooth", "long-battery"]
    },
    {
        product_id: "P002",
        name: "Organic Cotton T-Shirt",
        category: "Clothing",
        price: 29.99,
        rating: 4.2,
        description: "Soft organic cotton t-shirt available in multiple colors",
        brand: "EcoWear",
        in_stock: true,
        features: ["organic", "cotton", "comfortable", "eco-friendly"]
    },
    {
        product_id: "P003",
        name: "JavaScript Programming Book",
        category: "Books",
        price: 39.99,
        rating: 4.7,
        description: "Comprehensive guide to modern JavaScript development",
        brand: "TechBooks",
        in_stock: true,
        features: ["programming", "javascript", "tutorial", "advanced"]
    },
    {
        product_id: "P004",
        name: "Smart Fitness Watch",
        category: "Electronics",
        price: 199.99,
        rating: 4.4,
        description: "Advanced fitness tracker with heart rate monitoring",
        brand: "FitTech",
        in_stock: true,
        features: ["fitness", "smart", "heart-rate", "gps"]
    },
    {
        product_id: "P005",
        name: "Yoga Mat Premium",
        category: "Sports",
        price: 49.99,
        rating: 4.6,
        description: "Non-slip premium yoga mat for all skill levels",
        brand: "YogaPro",
        in_stock: true,
        features: ["yoga", "non-slip", "premium", "exercise"]
    }
];

const USERS = {
    "U001": {
        user_id: "U001",
        name: "Alice Johnson",
        age: 28,
        location: "New York",
        preferences: ["Electronics", "Books"],
        interaction_history: [
            { product_id: "P001", type: "purchase", rating: 5 },
            { product_id: "P003", type: "view", rating: null }
        ]
    },
    "U002": {
        user_id: "U002",
        name: "Bob Smith",
        age: 35,
        location: "California",
        preferences: ["Sports", "Electronics"],
        interaction_history: [
            { product_id: "P004", type: "purchase", rating: 4 },
            { product_id: "P005", type: "add_to_cart", rating: null }
        ]
    }
};

const RECOMMENDATION_ALGORITHMS = {
    collaborative_filtering: {
        description: "User-based collaborative filtering using cosine similarity",
        accuracy: 0.78
    },
    content_based: {
        description: "Content-based filtering using product features",
        accuracy: 0.72
    },
    hybrid: {
        description: "Hybrid approach combining collaborative and content-based",
        accuracy: 0.84
    },
    popularity: {
        description: "Popularity-based recommendations",
        accuracy: 0.65
    }
};

const LLM_EXPLANATION_TEMPLATES = {
    collaborative: "Users with similar preferences to you also enjoyed this product. Based on your purchase history and ratings, we think you'll love it too.",
    content_based: "This product matches your interest in {category} and has features similar to items you've previously purchased: {features}.",
    hybrid: "This recommendation combines insights from similar users and your personal preferences for {category} products with {key_features}.",
    popularity: "This is a trending product in {category} with excellent ratings ({rating}/5) that many customers in {location} have purchased recently."
};

// Application State
let currentUser = 'U001';
let currentView = 'dashboard';
let currentAlgorithm = 'hybrid';
let userInteractions = {}; // Track new interactions in current session

// Utility Functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function formatRating(rating) {
    return `${rating} ⭐`;
}

function getRandomColor() {
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Recommendation Algorithms
class RecommendationEngine {
    static calculateCosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }

    static getUserVector(userId) {
        const user = USERS[userId];
        const vector = new Array(PRODUCTS.length).fill(0);
        
        user.interaction_history.forEach(interaction => {
            const productIndex = PRODUCTS.findIndex(p => p.product_id === interaction.product_id);
            if (productIndex !== -1) {
                let weight = 0;
                switch (interaction.type) {
                    case 'purchase': weight = 5; break;
                    case 'add_to_cart': weight = 3; break;
                    case 'view': weight = 1; break;
                    default: weight = 1;
                }
                if (interaction.rating) {
                    weight *= (interaction.rating / 5);
                }
                vector[productIndex] = weight;
            }
        });
        
        return vector;
    }

    static getContentVector(product) {
        const categories = [...new Set(PRODUCTS.map(p => p.category))];
        const allFeatures = [...new Set(PRODUCTS.flatMap(p => p.features))];
        
        const vector = [];
        
        // Category encoding
        categories.forEach(cat => {
            vector.push(product.category === cat ? 1 : 0);
        });
        
        // Feature encoding
        allFeatures.forEach(feature => {
            vector.push(product.features.includes(feature) ? 1 : 0);
        });
        
        // Price normalized (0-1 range)
        const maxPrice = Math.max(...PRODUCTS.map(p => p.price));
        vector.push(product.price / maxPrice);
        
        // Rating normalized
        vector.push(product.rating / 5);
        
        return vector;
    }

    static collaborativeFiltering(userId, limit = 3) {
        const userVector = this.getUserVector(userId);
        const recommendations = [];
        
        // Find products user hasn't interacted with
        const user = USERS[userId];
        const interactedProducts = user.interaction_history.map(i => i.product_id);
        const candidateProducts = PRODUCTS.filter(p => !interactedProducts.includes(p.product_id));
        
        // For each candidate product, calculate similarity score
        candidateProducts.forEach(product => {
            const productIndex = PRODUCTS.findIndex(p => p.product_id === product.product_id);
            
            // Simulate other users' preferences for collaborative filtering
            let totalSimilarity = 0;
            let weightedRating = 0;
            
            Object.values(USERS).forEach(otherUser => {
                if (otherUser.user_id === userId) return;
                
                const otherVector = this.getUserVector(otherUser.user_id);
                const similarity = this.calculateCosineSimilarity(userVector, otherVector);
                
                if (similarity > 0.1) { // Only consider similar users
                    const otherInteraction = otherUser.interaction_history.find(i => i.product_id === product.product_id);
                    if (otherInteraction) {
                        let score = 3; // default score
                        if (otherInteraction.rating) score = otherInteraction.rating;
                        else if (otherInteraction.type === 'purchase') score = 4.5;
                        else if (otherInteraction.type === 'add_to_cart') score = 3.5;
                        
                        totalSimilarity += similarity;
                        weightedRating += similarity * score;
                    }
                }
            });
            
            if (totalSimilarity > 0) {
                const score = weightedRating / totalSimilarity;
                recommendations.push({
                    product: product,
                    score: score,
                    confidence: Math.min(totalSimilarity * 100, 95) // Convert to percentage
                });
            }
        });
        
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    static contentBasedFiltering(userId, limit = 3) {
        const user = USERS[userId];
        const interactedProducts = user.interaction_history.map(i => i.product_id);
        
        // Get user's preferred product features
        const userPreferredFeatures = [];
        user.interaction_history.forEach(interaction => {
            const product = PRODUCTS.find(p => p.product_id === interaction.product_id);
            if (product && (interaction.type === 'purchase' || interaction.rating >= 4)) {
                userPreferredFeatures.push(...product.features);
            }
        });
        
        // Calculate feature frequency
        const featureFreq = {};
        userPreferredFeatures.forEach(feature => {
            featureFreq[feature] = (featureFreq[feature] || 0) + 1;
        });
        
        const candidateProducts = PRODUCTS.filter(p => !interactedProducts.includes(p.product_id));
        const recommendations = [];
        
        candidateProducts.forEach(product => {
            let score = 0;
            let matchingFeatures = 0;
            
            // Category preference bonus
            if (user.preferences.includes(product.category)) {
                score += 2;
            }
            
            // Feature matching score
            product.features.forEach(feature => {
                if (featureFreq[feature]) {
                    score += featureFreq[feature] * 0.5;
                    matchingFeatures++;
                }
            });
            
            // Rating bonus
            score += (product.rating - 3) * 0.5;
            
            if (score > 0) {
                recommendations.push({
                    product: product,
                    score: score,
                    confidence: Math.min((matchingFeatures / product.features.length) * 100, 90)
                });
            }
        });
        
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    static hybridRecommendation(userId, limit = 3) {
        const collaborative = this.collaborativeFiltering(userId, limit * 2);
        const contentBased = this.contentBasedFiltering(userId, limit * 2);
        
        // Combine and weight the recommendations
        const combinedScores = {};
        
        collaborative.forEach(rec => {
            const productId = rec.product.product_id;
            combinedScores[productId] = {
                product: rec.product,
                collaborativeScore: rec.score * 0.6, // 60% weight
                contentScore: 0,
                confidence: rec.confidence
            };
        });
        
        contentBased.forEach(rec => {
            const productId = rec.product.product_id;
            if (combinedScores[productId]) {
                combinedScores[productId].contentScore = rec.score * 0.4; // 40% weight
                combinedScores[productId].confidence = (combinedScores[productId].confidence + rec.confidence) / 2;
            } else {
                combinedScores[productId] = {
                    product: rec.product,
                    collaborativeScore: 0,
                    contentScore: rec.score * 0.4,
                    confidence: rec.confidence
                };
            }
        });
        
        const recommendations = Object.values(combinedScores).map(item => ({
            product: item.product,
            score: item.collaborativeScore + item.contentScore,
            confidence: Math.min(item.confidence + 10, 95) // Hybrid bonus
        }));
        
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    static popularityBasedRecommendation(userId, limit = 3) {
        const user = USERS[userId];
        const interactedProducts = user.interaction_history.map(i => i.product_id);
        
        const candidateProducts = PRODUCTS.filter(p => !interactedProducts.includes(p.product_id));
        
        // Calculate popularity score based on rating and simulated purchase count
        const recommendations = candidateProducts.map(product => {
            const popularityScore = (product.rating * 0.7) + (Math.random() * 2.5); // Simulate popularity
            return {
                product: product,
                score: popularityScore,
                confidence: Math.min(product.rating * 18, 85) // Based on rating confidence
            };
        });
        
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    static getRecommendations(userId, algorithm = 'hybrid', limit = 3) {
        switch (algorithm) {
            case 'collaborative':
                return this.collaborativeFiltering(userId, limit);
            case 'content_based':
                return this.contentBasedFiltering(userId, limit);
            case 'hybrid':
                return this.hybridRecommendation(userId, limit);
            case 'popularity':
                return this.popularityBasedRecommendation(userId, limit);
            default:
                return this.hybridRecommendation(userId, limit);
        }
    }

    static generateExplanation(userId, product, algorithm) {
        const user = USERS[userId];
        let template = LLM_EXPLANATION_TEMPLATES[algorithm] || LLM_EXPLANATION_TEMPLATES.hybrid;
        
        // Replace placeholders
        template = template.replace('{category}', product.category);
        template = template.replace('{rating}', product.rating);
        template = template.replace('{location}', user.location);
        
        // Handle features
        if (template.includes('{features}')) {
            const features = product.features.slice(0, 3).join(', ');
            template = template.replace('{features}', features);
        }
        
        if (template.includes('{key_features}')) {
            const keyFeatures = product.features.slice(0, 2).join(' and ');
            template = template.replace('{key_features}', keyFeatures);
        }
        
        return template;
    }
}

// User Interaction Tracking
function trackInteraction(userId, productId, type, rating = null) {
    if (!userInteractions[userId]) {
        userInteractions[userId] = [];
    }
    
    userInteractions[userId].push({
        product_id: productId,
        type: type,
        rating: rating,
        timestamp: new Date().toISOString()
    });
    
    // Also add to the main user data for immediate effect
    if (USERS[userId]) {
        USERS[userId].interaction_history.push({
            product_id: productId,
            type: type,
            rating: rating
        });
    }
    
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} tracked for product!`, 'success');
    
    // Refresh current view
    if (currentView === 'dashboard') {
        loadDashboard();
    } else if (currentView === 'profile') {
        loadProfile();
    }
}

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    toast.innerHTML = `
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Initialize Application
function initApp() {
    setupNavigation();
    setupUserSelector();
    setupAlgorithmSelector();
    loadDashboard();
    
    // Load initial analytics
    setTimeout(() => {
        if (currentView === 'analytics') {
            loadAnalytics();
        }
    }, 100);
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav__item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
            
            // Update active state
            navItems.forEach(navItem => navItem.classList.remove('nav__item--active'));
            item.classList.add('nav__item--active');
        });
    });
}

// User Selector Setup
function setupUserSelector() {
    const userSelector = document.getElementById('userSelector');
    userSelector.addEventListener('change', (e) => {
        currentUser = e.target.value;
        // Reload current view with new user data
        switchView(currentView);
        showToast(`Switched to ${USERS[currentUser].name}`, 'info');
    });
}

// Algorithm Selector Setup
function setupAlgorithmSelector() {
    const algorithmSelector = document.getElementById('algorithmSelector');
    if (algorithmSelector) {
        algorithmSelector.addEventListener('change', (e) => {
            currentAlgorithm = e.target.value;
            loadRecommendations();
            showToast(`Switched to ${RECOMMENDATION_ALGORITHMS[currentAlgorithm].description}`, 'info');
        });
    }
}

// View Switching
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('view--active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('view--active');
        currentView = viewName;
        
        // Load view-specific content
        switch (viewName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'catalog':
                loadCatalog();
                break;
            case 'profile':
                loadProfile();
                break;
            case 'analytics':
                loadAnalytics();
                break;
            case 'api':
                loadAPIDemo();
                break;
        }
    }
}

// Dashboard Loading
function loadDashboard() {
    updateUserStats();
    loadRecommendations();
    setupAlgorithmSelector(); // Re-setup in case it wasn't ready before
}

function updateUserStats() {
    const user = USERS[currentUser];
    const interactions = user.interaction_history.concat(userInteractions[currentUser] || []);
    
    // Calculate stats
    const purchases = interactions.filter(i => i.type === 'purchase').length;
    const views = interactions.length;
    const ratings = interactions.filter(i => i.rating !== null);
    const avgRating = ratings.length > 0 ? 
        ratings.reduce((sum, i) => sum + i.rating, 0) / ratings.length : 0;
    
    // Update UI
    document.getElementById('accuracy-stat').textContent = 
        `${Math.round(RECOMMENDATION_ALGORITHMS[currentAlgorithm].accuracy * 100)}%`;
    document.getElementById('purchases-stat').textContent = purchases;
    document.getElementById('views-stat').textContent = views;
    document.getElementById('rating-stat').textContent = avgRating > 0 ? avgRating.toFixed(1) : '0.0';
}

function loadRecommendations() {
    const recommendations = RecommendationEngine.getRecommendations(currentUser, currentAlgorithm, 6);
    const container = document.getElementById('recommendations-grid');
    
    container.innerHTML = recommendations.map(rec => {
        const explanation = RecommendationEngine.generateExplanation(currentUser, rec.product, currentAlgorithm);
        
        return `
            <div class="recommendation-card">
                <div class="recommendation-card__header">
                    <h4 class="recommendation-card__title">${rec.product.name}</h4>
                    <div class="recommendation-card__meta">
                        <span class="recommendation-card__price">${formatPrice(rec.product.price)}</span>
                        <span class="recommendation-card__rating">${formatRating(rec.product.rating)}</span>
                    </div>
                    <span class="recommendation-card__category">${rec.product.category}</span>
                </div>
                <div class="recommendation-card__body">
                    <p class="recommendation-card__description">${rec.product.description}</p>
                    
                    <div class="recommendation-card__explanation">
                        <h4>🤖 Why recommended?</h4>
                        <p>${explanation}</p>
                    </div>
                    
                    <div class="recommendation-card__actions">
                        <button class="btn btn--primary btn--sm" onclick="trackInteraction('${currentUser}', '${rec.product.product_id}', 'purchase', 5)">
                            Buy Now
                        </button>
                        <button class="btn btn--secondary btn--sm" onclick="trackInteraction('${currentUser}', '${rec.product.product_id}', 'add_to_cart')">
                            Add to Cart
                        </button>
                        <button class="btn btn--outline btn--sm" onclick="trackInteraction('${currentUser}', '${rec.product.product_id}', 'view')">
                            View Details
                        </button>
                    </div>
                    
                    <div class="recommendation-card__confidence">
                        <span class="confidence-label">Confidence:</span>
                        <div class="confidence-score">
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${rec.confidence}%"></div>
                            </div>
                            <span class="confidence-percentage">${Math.round(rec.confidence)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);