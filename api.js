// E-commerce Product Recommender - API Demo and Analytics

// Analytics Functions
function loadAnalytics() {
    // Destroy existing charts if they exist
    Object.values(Chart.instances || {}).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    
    setTimeout(() => {
        createAlgorithmChart();
        createEngagementChart();
        createCategoriesChart();
        createTrendsChart();
    }, 100);
}

function createAlgorithmChart() {
    const ctx = document.getElementById('algorithmChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Collaborative Filtering', 'Content-Based', 'Hybrid', 'Popularity'],
            datasets: [{
                label: 'Accuracy (%)',
                data: [78, 72, 84, 65],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Algorithm Accuracy Comparison'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createEngagementChart() {
    const ctx = document.getElementById('engagementChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Purchases', 'Add to Cart', 'Views', 'Ratings'],
            datasets: [{
                data: [25, 30, 35, 10],
                backgroundColor: ['#5D878F', '#DB4545', '#D2BA4C', '#964325'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'User Interaction Distribution'
                }
            }
        }
    });
}

function createCategoriesChart() {
    const ctx = document.getElementById('categoriesChart');
    if (!ctx) return;
    
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    const categoryData = categories.map(cat => {
        const products = PRODUCTS.filter(p => p.category === cat);
        return products.reduce((sum, p) => sum + p.rating, 0) / products.length;
    });
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Average Rating',
                data: categoryData,
                backgroundColor: 'rgba(31, 184, 205, 0.2)',
                borderColor: '#1FB8CD',
                borderWidth: 2,
                pointBackgroundColor: '#1FB8CD',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Category Performance by Rating'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Recommendation Accuracy',
                    data: [75, 78, 82, 80, 84, 87],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'User Engagement',
                    data: [60, 65, 70, 68, 72, 75],
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Trends Over Time'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// API Demo Functions
function loadAPIDemo() {
    setupAPIButtons();
    showWelcomeMessage();
}

function setupAPIButtons() {
    const buttons = document.querySelectorAll('[data-endpoint]');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const endpoint = button.dataset.endpoint;
            simulateAPICall(endpoint);
        });
    });
}

function showWelcomeMessage() {
    const responseContainer = document.getElementById('api-response-content');
    responseContainer.textContent = 'Welcome to the API Demo! Click "Try It" on any endpoint above to see a sample response.';
}

function simulateAPICall(endpoint) {
    const responseContainer = document.getElementById('api-response-content');
    
    // Show loading state
    responseContainer.textContent = 'Loading...';
    
    // Simulate network delay
    setTimeout(() => {
        let response;
        
        switch (endpoint) {
            case 'recommendations':
                response = generateRecommendationsAPIResponse();
                break;
            case 'products':
                response = generateProductsAPIResponse();
                break;
            case 'interactions':
                response = generateInteractionsAPIResponse();
                break;
            case 'explanations':
                response = generateExplanationsAPIResponse();
                break;
            default:
                response = { error: 'Unknown endpoint' };
        }
        
        responseContainer.textContent = JSON.stringify(response, null, 2);
        showToast(`${endpoint} API called successfully!`, 'success');
    }, 500 + Math.random() * 1000); // Random delay between 500-1500ms
}

function generateRecommendationsAPIResponse() {
    const recommendations = RecommendationEngine.getRecommendations(currentUser, currentAlgorithm, 3);
    
    return {
        status: 'success',
        user_id: currentUser,
        algorithm: currentAlgorithm,
        recommendations: recommendations.map(rec => ({
            product_id: rec.product.product_id,
            name: rec.product.name,
            category: rec.product.category,
            price: rec.product.price,
            rating: rec.product.rating,
            score: parseFloat(rec.score.toFixed(3)),
            confidence: parseFloat(rec.confidence.toFixed(1)),
            explanation: RecommendationEngine.generateExplanation(currentUser, rec.product, currentAlgorithm)
        })),
        metadata: {
            algorithm_accuracy: RECOMMENDATION_ALGORITHMS[currentAlgorithm].accuracy,
            generation_time: '0.045s',
            timestamp: new Date().toISOString()
        }
    };
}

function generateProductsAPIResponse() {
    return {
        status: 'success',
        total_products: PRODUCTS.length,
        products: PRODUCTS.map(product => ({
            product_id: product.product_id,
            name: product.name,
            category: product.category,
            price: product.price,
            rating: product.rating,
            brand: product.brand,
            in_stock: product.in_stock,
            features: product.features,
            description: product.description
        })),
        filters: {
            categories: [...new Set(PRODUCTS.map(p => p.category))],
            price_range: {
                min: Math.min(...PRODUCTS.map(p => p.price)),
                max: Math.max(...PRODUCTS.map(p => p.price))
            },
            rating_range: {
                min: Math.min(...PRODUCTS.map(p => p.rating)),
                max: Math.max(...PRODUCTS.map(p => p.rating))
            }
        },
        metadata: {
            page: 1,
            per_page: 50,
            total_pages: 1,
            timestamp: new Date().toISOString()
        }
    };
}

function generateInteractionsAPIResponse() {
    const user = USERS[currentUser];
    const sessionInteractions = userInteractions[currentUser] || [];
    
    return {
        status: 'success',
        message: 'Interaction tracked successfully',
        interaction: {
            user_id: currentUser,
            product_id: 'P001',
            type: 'view',
            timestamp: new Date().toISOString(),
            session_id: 'sess_' + Math.random().toString(36).substr(2, 9)
        },
        user_stats: {
            total_interactions: user.interaction_history.length + sessionInteractions.length,
            purchases: user.interaction_history.filter(i => i.type === 'purchase').length,
            views: user.interaction_history.filter(i => i.type === 'view').length,
            cart_additions: user.interaction_history.filter(i => i.type === 'add_to_cart').length
        },
        recommendations_updated: true,
        metadata: {
            processing_time: '0.023s',
            timestamp: new Date().toISOString()
        }
    };
}

function generateExplanationsAPIResponse() {
    const sampleProduct = PRODUCTS[0];
    const explanation = RecommendationEngine.generateExplanation(currentUser, sampleProduct, currentAlgorithm);
    
    return {
        status: 'success',
        product_id: sampleProduct.product_id,
        user_id: currentUser,
        algorithm: currentAlgorithm,
        explanation: {
            text: explanation,
            confidence: 85.7,
            factors: [
                {
                    type: 'user_preference',
                    weight: 0.4,
                    description: 'User shows strong preference for Electronics category'
                },
                {
                    type: 'collaborative_signal',
                    weight: 0.35,
                    description: 'Similar users with comparable interaction patterns'
                },
                {
                    type: 'content_similarity',
                    weight: 0.25,
                    description: 'Product features align with user history'
                }
            ],
            personalization_score: 92.3
        },
        alternative_explanations: [
            {
                algorithm: 'collaborative_filtering',
                text: LLM_EXPLANATION_TEMPLATES.collaborative,
                confidence: 78.0
            },
            {
                algorithm: 'content_based',
                text: LLM_EXPLANATION_TEMPLATES.content_based.replace('{category}', sampleProduct.category).replace('{features}', sampleProduct.features.slice(0, 3).join(', ')),
                confidence: 72.0
            }
        ],
        metadata: {
            llm_model: 'recommendation-explainer-v2.1',
            generation_time: '0.156s',
            tokens_used: 127,
            timestamp: new Date().toISOString()
        }
    };
}

// Mock API Endpoints Data
const API_ENDPOINTS = {
    recommendations: {
        method: 'GET',
        path: '/api/recommendations/{user_id}',
        description: 'Get personalized product recommendations for a specific user',
        parameters: {
            user_id: 'string (required) - User identifier',
            algorithm: 'string (optional) - Algorithm type: collaborative, content_based, hybrid, popularity',
            limit: 'integer (optional) - Number of recommendations (default: 10)',
            category: 'string (optional) - Filter by product category'
        },
        example_request: {
            url: 'GET /api/recommendations/U001?algorithm=hybrid&limit=5',
            headers: {
                'Authorization': 'Bearer your-api-key',
                'Content-Type': 'application/json'
            }
        }
    },
    products: {
        method: 'GET',
        path: '/api/products',
        description: 'Retrieve product catalog with optional filtering and pagination',
        parameters: {
            category: 'string (optional) - Filter by category',
            min_price: 'number (optional) - Minimum price filter',
            max_price: 'number (optional) - Maximum price filter',
            min_rating: 'number (optional) - Minimum rating filter',
            search: 'string (optional) - Search in product name/description',
            page: 'integer (optional) - Page number (default: 1)',
            per_page: 'integer (optional) - Items per page (default: 20)'
        },
        example_request: {
            url: 'GET /api/products?category=Electronics&min_rating=4.0&page=1',
            headers: {
                'Authorization': 'Bearer your-api-key',
                'Content-Type': 'application/json'
            }
        }
    },
    interactions: {
        method: 'POST',
        path: '/api/interactions',
        description: 'Track user interactions with products for recommendation improvement',
        parameters: {
            user_id: 'string (required) - User identifier',
            product_id: 'string (required) - Product identifier',
            interaction_type: 'string (required) - Type: view, purchase, add_to_cart, rating',
            rating: 'number (optional) - Rating value 1-5 (required for rating type)',
            session_id: 'string (optional) - Session identifier'
        },
        example_request: {
            url: 'POST /api/interactions',
            headers: {
                'Authorization': 'Bearer your-api-key',
                'Content-Type': 'application/json'
            },
            body: {
                user_id: 'U001',
                product_id: 'P001',
                interaction_type: 'purchase',
                rating: 5,
                session_id: 'sess_abc123'
            }
        }
    },
    explanations: {
        method: 'GET',
        path: '/api/explanations',
        description: 'Get AI-generated explanations for why products are recommended',
        parameters: {
            user_id: 'string (required) - User identifier',
            product_id: 'string (required) - Product identifier',
            algorithm: 'string (optional) - Algorithm used for explanation',
            detail_level: 'string (optional) - brief, detailed, technical'
        },
        example_request: {
            url: 'GET /api/explanations?user_id=U001&product_id=P001&algorithm=hybrid',
            headers: {
                'Authorization': 'Bearer your-api-key',
                'Content-Type': 'application/json'
            }
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAnalytics,
        loadAPIDemo,
        API_ENDPOINTS
    };
}