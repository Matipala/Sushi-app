const UserService = require('../service/UserService');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const user = await UserService.register({ name, email, password });
        res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Email already in use' });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { user, token } = await UserService.login({ email, password });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        if (error.status === 401) {
            return res.status(401).json({ error: error.message || 'Invalid credentials' });
        }
        next(error);
    }
};
