import express from 'express';
import users from '../db/mysql/users.js'; // Import the users module


const authRouter = express.Router();

// Login endpoint
authRouter.post('/login', (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Request body is required' });
    }

    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    users.verifyUserCredentials(usernameOrEmail, password)
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Store user information in session
            req.session.user = { id: user.id, username: user.username, email: user.email };
            res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
        })
        .catch(error => {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Sign up endpoint
authRouter.post('/signup', (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Request body is required' });
    }

    const { username, email, password } = req.body;

    if (!req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    users.createUser(username, email, password)
        .then(newUser => {
            // Store new user information in session
            req.session.user = { id: newUser.id, username: newUser.username, email: newUser.email };
            res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
        })
        .catch(error => {
            if (error.message === 'Invalid email format') {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            if (error.message === 'Username or email already exists') {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            if (error.message === 'Username can only contain letters, numbers, underscores, and periods') {
                return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and periods' });
            }

            console.error('Error during signup:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

authRouter.get('/logout', (req, res) => {
    // Destroy the session to log out the user
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Logout successful' });
    });
});

authRouter.get('/session', (req, res) => {
    // Check if the user is logged in by checking the session
    if (req.session && req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
});

export default authRouter;