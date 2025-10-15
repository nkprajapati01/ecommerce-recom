// E-commerce Product Recommender - UI Components and View Management

// Product Catalog Functions
function loadCatalog() {
    setupCatalogFilters();
    displayProducts(PRODUCTS);
}

function setupCatalogFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    
    // Category filter
    categoryFilter.addEventListener('change', () => {
        applyFilters();
    });
    
    // Search filter
    searchInput.addEventListener('input', () => {
        applyFilters();
    });
    
    // Sort filter
    sortFilter.addEventListener('change', () => {
        applyFilters();
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortFilter').value;
    
    let filteredProducts = PRODUCTS.filter(product => {
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm);
        
        return matchesCategory && matchesSearch;
    });
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return a.price - b.price;
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });
    
    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const container = document.getElementById('products-grid');
    
    if (products.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-text-secondary);">No products found matching your criteria.</div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="trackInteraction('${currentUser}', '${product.product_id}', 'view')">
            <div class="product-card__header">
                <h4 class="product-card__title">${product.name}</h4>
                <div class="product-card__brand">${product.brand}</div>
                <div class="product-card__meta">
                    <span class="product-card__price">${formatPrice(product.price)}</span>
                    <span class="product-card__rating">${formatRating(product.rating)}</span>
                </div>
            </div>
            <div class="product-card__body">
                <p class="product-card__description">${product.description}</p>
                
                <div class="product-card__features">
                    ${product.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                
                <div class="product-card__actions">
                    <button class="btn btn--primary btn--sm" onclick="event.stopPropagation(); trackInteraction('${currentUser}', '${product.product_id}', 'purchase', 5)">
                        Buy ${formatPrice(product.price)}
                    </button>
                    <button class="btn btn--secondary btn--sm" onclick="event.stopPropagation(); trackInteraction('${currentUser}', '${product.product_id}', 'add_to_cart')">
                        Add to Cart
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); showRatingModal('${product.product_id}')">
                        Rate Product
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// User Profile Functions
function loadProfile() {
    const user = USERS[currentUser];
    const allInteractions = user.interaction_history.concat(userInteractions[currentUser] || []);
    
    // Profile details
    document.getElementById('profile-details').innerHTML = `
        <div class="profile-detail">
            <span class="profile-detail__label">Name:</span>
            <span class="profile-detail__value">${user.name}</span>
        </div>
        <div class="profile-detail">
            <span class="profile-detail__label">Age:</span>
            <span class="profile-detail__value">${user.age}</span>
        </div>
        <div class="profile-detail">
            <span class="profile-detail__label">Location:</span>
            <span class="profile-detail__value">${user.location}</span>
        </div>
        <div class="profile-detail">
            <span class="profile-detail__label">Member Since:</span>
            <span class="profile-detail__value">January 2024</span>
        </div>
    `;
    
    // User preferences
    document.getElementById('user-preferences').innerHTML = `
        <div style="margin-bottom: 1rem;">
            ${user.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('')}
        </div>
        <button class="btn btn--outline btn--sm" onclick="showPreferencesModal()">Edit Preferences</button>
    `;
    
    // Interaction history
    const historyHTML = allInteractions.length > 0 ? 
        allInteractions.map(interaction => {
            const product = PRODUCTS.find(p => p.product_id === interaction.product_id);
            if (!product) return '';
            
            return `
                <div class="interaction-item">
                    <span class="interaction-type interaction-type--${interaction.type}">
                        ${interaction.type.replace('_', ' ')}
                    </span>
                    <div class="interaction-details">
                        <div class="interaction-product">${product.name}</div>
                        <div class="interaction-rating">
                            ${interaction.rating ? `Rating: ${interaction.rating} ⭐` : 'No rating'}
                        </div>
                    </div>
                </div>
            `;
        }).join('') : '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">No interactions yet. Start browsing products to see your history here!</p>';
    
    document.getElementById('interaction-history').innerHTML = historyHTML;
    
    // Personal recommendations
    const personalRecs = RecommendationEngine.getRecommendations(currentUser, 'hybrid', 3);
    const recsHTML = personalRecs.map(rec => `
        <div class="recommendation-card" style="margin-bottom: 1rem;">
            <div class="recommendation-card__header">
                <h5 class="recommendation-card__title" style="font-size: var(--font-size-base); margin-bottom: var(--space-4);">${rec.product.name}</h5>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: var(--font-weight-semibold); color: var(--color-primary);">${formatPrice(rec.product.price)}</span>
                    <span style="font-size: var(--font-size-sm);">${Math.round(rec.confidence)}% match</span>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('profile-recommendations').innerHTML = recsHTML;
}

// Rating Modal
function showRatingModal(productId) {
    const product = PRODUCTS.find(p => p.product_id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="card" style="max-width: 400px; margin: 2rem;">
            <div class="card__body">
                <h3 style="margin-bottom: 1rem;">Rate Product</h3>
                <h4 style="color: var(--color-text-secondary); margin-bottom: 1.5rem; font-weight: var(--font-weight-normal);">${product.name}</h4>
                
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div class="rating-stars" style="font-size: 2rem; margin-bottom: 0.5rem;">
                        ${[1,2,3,4,5].map(star => `
                            <span class="rating-star" data-rating="${star}" style="cursor: pointer; color: var(--color-text-secondary); margin: 0 0.1rem;">⭐</span>
                        `).join('')}
                    </div>
                    <div id="rating-text" style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Click to rate</div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn--outline" onclick="this.closest('[style*="position: fixed"]').remove()">Cancel</button>
                    <button class="btn btn--primary" id="submit-rating" disabled onclick="submitRating('${productId}')">Submit Rating</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Rating functionality
    let selectedRating = 0;
    const stars = modal.querySelectorAll('.rating-star');
    const ratingText = modal.querySelector('#rating-text');
    const submitBtn = modal.querySelector('#submit-rating');
    
    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(stars, rating);
            ratingText.textContent = ratingLabels[rating];
        });
        
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            submitBtn.disabled = false;
            ratingText.textContent = `You rated: ${ratingLabels[selectedRating]}`;
        });
    });
    
    modal.addEventListener('mouseleave', () => {
        if (selectedRating > 0) {
            highlightStars(stars, selectedRating);
            ratingText.textContent = `You rated: ${ratingLabels[selectedRating]}`;
        } else {
            highlightStars(stars, 0);
            ratingText.textContent = 'Click to rate';
        }
    });
    
    // Store rating for submit function
    window.tempRating = selectedRating;
    window.tempModal = modal;
    
    function highlightStars(starElements, rating) {
        starElements.forEach((star, index) => {
            star.style.color = index < rating ? '#FFD700' : 'var(--color-text-secondary)';
        });
    }
}

function submitRating(productId) {
    const rating = parseInt(document.querySelector('.rating-star[style*="#FFD700"]:last-of-type')?.dataset.rating) || window.tempRating;
    if (rating > 0) {
        trackInteraction(currentUser, productId, 'rating', rating);
        window.tempModal?.remove();
        showToast(`Thank you for rating this product ${rating} stars!`, 'success');
    }
}

// Preferences Modal
function showPreferencesModal() {
    const user = USERS[currentUser];
    const allCategories = [...new Set(PRODUCTS.map(p => p.category))];
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="card" style="max-width: 500px; margin: 2rem;">
            <div class="card__body">
                <h3 style="margin-bottom: 1rem;">Edit Preferences</h3>
                <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">Select categories you're interested in:</p>
                
                <div class="preference-options" style="margin-bottom: 1.5rem;">
                    ${allCategories.map(category => `
                        <label style="display: flex; align-items: center; margin-bottom: 0.5rem; cursor: pointer;">
                            <input type="checkbox" value="${category}" 
                                   ${user.preferences.includes(category) ? 'checked' : ''}
                                   style="margin-right: 0.5rem;">
                            <span>${category}</span>
                        </label>
                    `).join('')}
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn--outline" onclick="this.closest('[style*="position: fixed"]').remove()">Cancel</button>
                    <button class="btn btn--primary" onclick="updatePreferences()">Save Preferences</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.tempModal = modal;
}

function updatePreferences() {
    const modal = window.tempModal;
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
    const newPreferences = Array.from(checkboxes).map(cb => cb.value);
    
    USERS[currentUser].preferences = newPreferences;
    modal.remove();
    
    // Reload profile to show updated preferences
    loadProfile();
    showToast('Preferences updated successfully!', 'success');
}