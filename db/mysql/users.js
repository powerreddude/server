import mysqlConnection from "./mysql.js";
import bcrypt from "bcrypt";

const users = {
    /**
     * Retrieves a user by their ID.
     * @async
     * @param {number} id - The ID of the user to retrieve.
     * @returns {Promise<Object>} The user object containing id, username, email, created_at, and updated_at.
     * @throws {Error} If the user ID is not provided.
     */
    async getUserById(id) {
        if (!id) {
            throw new Error("User ID is required");
        }

        const [results] = await mysqlConnection.query(
            'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );

        const user = results[0];

        return { ...user };
    },

    /**
     * Retrieves a user by their username or email.
     * @async
     * @param {string} usernameOrEmail - The username or email of the user to retrieve.
     * @returns {Promise<Object|null>} The user object containing id, username, email, created_at, and updated_at, or null if not found.
     * @throws {Error} If the username or email is not provided.
     */
    async getUserByUsernameOrEmail(usernameOrEmail) {
        if (!usernameOrEmail) {
            throw new Error("Username or email is required");
        }

        const [results] = await mysqlConnection.query(
            'SELECT id, username, email, created_at, updated_at FROM users WHERE username = ? OR email = ?',
            [usernameOrEmail, usernameOrEmail]
        );

        if (results.length === 0) {
            return null; // User not found
        }

        const user = results[0];

        return { ...user };
    },

    /**
     * Verifies user credentials by comparing the provided password with the stored hashed password.
     * @async
     * @param {string} usernameOrEmail - The username or email of the user.
     * @param {string} password - The password to verify.
     * @returns {Promise<Object|boolean>} The user object excluding the password if credentials are valid, or false if invalid.
     * @throws {Error} If the username/email or password is not provided.
     */
    async verifyUserCredentials(usernameOrEmail, password) {
        if (!usernameOrEmail || !password) {
            throw new Error("Username/Email and password are required");
        }

        const [results] = await mysqlConnection.query(
            'SELECT id, username, email, password, created_at, updated_at FROM users WHERE username = ? OR email = ?',
            [usernameOrEmail, usernameOrEmail]
        );

        if (results.length === 0) {
            return false; // User not found
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Exclude password from the returned user object
        const { password: _, ...userWithoutPassword } = user;

        return isPasswordValid ? userWithoutPassword : false;
    },

    /**
     * Creates a new user with the provided username, email, and password.
     * @async
     * @param {string} username - The username of the new user.
     * @param {string} email - The email of the new user.
     * @param {string} password - The password of the new user.
     * @returns {Promise<Object>} The newly created user object containing id, username, and email.
     * @throws {Error} If any of the required fields are not provided or if the username/email already exists.
     */
    async createUser(username, email, password) {
        if (!username || !email || !password) {
            throw new Error("Username, email, and password are required");
        }
    
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
    
        // Validate username format: only allow alphanumeric characters, underscores, and periods
        const usernameRegex = /^[a-zA-Z0-9_.]+$/;
        if (!usernameRegex.test(username)) {
            throw new Error("Username can only contain letters, numbers, underscores, and periods");
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        try {
            // Insert the new user into the database
            const [result] = await mysqlConnection.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );
    
            return { id: result.insertId, username, email };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("Username or email already exists");
            }
            throw error; // Re-throw other errors
        }
    },

    /**
     * Updates a user's information based on the provided data object.
     * @async
     * @param {number} id - The ID of the user to update.
     * @param {Object} data - The data object containing fields to update (username, email, or password).
     * @returns {Promise<Object>} The updated user object containing id and updated fields.
     * @throws {Error} If the user ID or data object is not provided, or if no valid fields are provided for update.
     */
    async updateUser(id, data) {
        if (!id || !data || typeof data !== 'object') {
            throw new Error("User ID and data object are required");
        }

        const allowedFields = ['username', 'email', 'password'];
        const updates = Object.keys(data)
            .filter(key => allowedFields.includes(key))
            .map(key => {
                if (key === 'password') {
                    return bcrypt.hash(data[key], 10).then(hashedPassword => ({
                        key,
                        value: hashedPassword
                    }));
                }
                return { key, value: data[key] };
            });

        const resolvedUpdates = await Promise.all(updates);

        if (resolvedUpdates.length === 0) {
            throw new Error("No valid fields to update");
        }

        const updateQuery = resolvedUpdates.map(update => `${update.key} = ?`).join(', ');
        const updateValues = resolvedUpdates.map(update => update.value);

        await mysqlConnection.query(
            `UPDATE users SET ${updateQuery} WHERE id = ?`,
            [...updateValues, id]
        );

        return { id, ...data };
    },

    /**
     * Deletes a user by their ID.
     * @async
     * @param {number} id - The ID of the user to delete.
     * @returns {Promise<Object>} An object indicating success and a message confirming deletion.
     * @throws {Error} If the user ID is not provided or if the user is not found.
     */
    async deleteUser(id) {
        if (!id) {
            throw new Error("User ID is required");
        }

        const [result] = await mysqlConnection.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error("User not found");
        }

        return { success: true, message: "User deleted successfully" };
    }
}

export default users;