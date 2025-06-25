
export const API_BASE = 'http://localhost:3000/api';

async function request(path, options = {}) {
    const { headers: customHeaders = {}, ...rest } = options;

    const headers = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    const res = await fetch(`${API_BASE}${path}`, {
        headers,
        ...rest,
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const err = new Error(errBody.error || res.statusText);
        err.status = res.status;
        throw err;
    }

    return res.status === 204 ? null : res.json();
}

export function register({ name, email, password }) {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export function login({ email, password }) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function getCategories() {
    return request('/categories');
}
export function getCategoryById(id) {
    return request(`/categories/${id}`);
}
export function createCategory(name, token) {
    return request('/categories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
    });
}
export function updateCategory(id, name, token) {
    return request(`/categories/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
    });
}
export function deleteCategory(id, token) {
    return request(`/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getMenuItems() {
    return request('/menu-items');
}
export function getMenuItemById(id) {
    return request(`/menu-items/${id}`);
}
export function createMenuItem(data, token) {
    return request('/menu-items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}
export function updateMenuItem(id, data, token) {
    return request(`/menu-items/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}
export function deleteMenuItem(id, token) {
    return request(`/menu-items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getBlogPosts() {
    return request('/blogs');
}
export function getBlogPostById(id) {
    return request(`/blogs/${id}`);
}
export function createBlogPost(data, token) {
    return request('/blogs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}
export function updateBlogPost(id, data, token) {
    return request(`/blogs/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}
export function deleteBlogPost(id, token) {
    return request(`/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getReservations() {
    return request('/reservations');
}
export function getReservationById(id, token) {
    return request(`/reservations/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}
export function createReservation(data) {
    return request('/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
export function updateReservation(id, data, token) {
    return request(`/reservations/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}
export function deleteReservation(id, token) {
    return request(`/reservations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getCartItems(token) {
    return request('/cart', {
        headers: { Authorization: `Bearer ${token}` },
    });
}
export function addCartItem(menu_item_id, quantity, token) {
    return request('/cart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ menu_item_id, quantity }),
    });
}
export function updateCartItem(id, quantity, token) {
    return request(`/cart/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
    });
}
export function removeCartItem(id, token) {
    return request(`/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}
export function createOrder(body, token) {
    return request('/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
    });
}


