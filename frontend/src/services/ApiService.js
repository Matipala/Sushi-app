const ApiService = (() => {
    const API_BASE = 'http://localhost:3000/api';

    async function request(path, options = {}) {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            const err = new Error(errBody.error || res.statusText);
            err.status = res.status;
            throw err;
        }
        return res.status === 204 ? null : res.json();
    }

    // Auth
    async function register({ name, email, password }) {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }
    async function login({ email, password }) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    // Categories
    async function getCategories() { return request('/categories'); }
    async function getCategoryById(id) { return request(`/categories/${id}`); }
    async function createCategory(name, token) {
        return request('/categories', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name })
        });
    }
    async function updateCategory(id, name, token) {
        return request(`/categories/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name })
        });
    }
    async function deleteCategory(id, token) {
        return request(`/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // Menu Items
    async function getMenuItems() { return request('/menu-items'); }
    async function getMenuItemById(id) { return request(`/menu-items/${id}`); }
    async function createMenuItem(data, token) {
        return request('/menu-items', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    }
    async function updateMenuItem(id, data, token) {
        return request(`/menu-items/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    }
    async function deleteMenuItem(id, token) {
        return request(`/menu-items/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // Blog Posts
    async function getBlogPosts() { return request('/blogs'); }
    async function getBlogPostById(id) { return request(`/blogs/${id}`); }
    async function createBlogPost(data, token) {
        return request('/blogs', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    }
    async function updateBlogPost(id, data, token) {
        return request(`/blogs/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    }
    async function deleteBlogPost(id, token) {
        return request(`/blogs/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // Reservations
    async function getReservations() { return request('/reservations'); }
    async function getReservationById(id, token) {
        return request(`/reservations/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    }
    async function createReservation(data) {
        return request('/reservations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async function updateReservation(id, data, token) {
        return request(`/reservations/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    }
    async function deleteReservation(id, token) {
        return request(`/reservations/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // Cart
    async function getCartItems(token) {
        return request('/cart', { headers: { Authorization: `Bearer ${token}` } });
    }
    async function addCartItem(menu_item_id, quantity, token) {
        return request('/cart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ menu_item_id, quantity })
        });
    }
    async function updateCartItem(id, quantity, token) {
        return request(`/cart/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ quantity })
        });
    }
    async function removeCartItem(id, token) {
        return request(`/cart/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // Orders
    async function createOrder(items, token) {
        return request('/orders', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ items })
        });
    }
    // Favorites
    async function getFavorites(token) {
        return request('/favorites', {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    async function addFavorite(postId, token) {
        return request('/favorites', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ post_id: postId })
        });
    }

    async function removeFavorite(postId, token) {
        return request(`/favorites/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    }


    return {
        register, login,
        getCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
        getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem,
        getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost,
        getReservations, getReservationById, createReservation, updateReservation, deleteReservation,
        getCartItems, addCartItem, updateCartItem, removeCartItem,
        createOrder, getFavorites, addFavorite, removeFavorite
    };
})();

export default ApiService;


//Utilizamos el patron de diseño Module para ApiService este patron nos ofrece un contenedor autocontenido, coherente y único para toda la lógica de interacción con el backend, mejorando la mantenibilidad, la coherencia y la escalabilidad de la aplicación.
//para el encapsulamiento y privacidad, las variables internas como API_BASE o la función auxiliar request() quedan privadas.
//Solo exponemos públicamente los métodos que queremos (getMenuItems, createOrder, etc.), evitando fugas al espacio global.
