import express from 'express';
import users from '../db/mysql/users.js';


const usersRouter = express.Router();

// test endpoint
usersRouter.get('/test', async (req, res) => {
    try {
        // Test the users module methods
        const createUser = await users.createUser('donnis', 'donnis@donnis.net', 'password123');
        const verifyUserCredentials = await users.verifyUserCredentials('donnis', 'password123');
        const getUserById = await users.getUserById(createUser.id);
        const updateUser = await users.updateUser(createUser.id, { username: 'donnis_updated' });
        const deleteUser = await users.deleteUser(createUser.id);
        const getDeletedUser = await users.getUserById(createUser.id); // This should return null or an empty result if the user was deleted

        // Return the results
        res.json({
            createUser,
            verifyUserCredentials,
            getUserById,
            updateUser,
            deleteUser,
            getDeletedUser
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default usersRouter;