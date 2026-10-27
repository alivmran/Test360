import { User } from './user.model.js';

export class AuthService {
  /**
   * Register a new user with dynamic user-provided input
   */
  static async registerUser({ name, email, password, githubUsername, role, organization, bio }) {
    if (!name || !email) {
      throw new Error('Name and email are required fields');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || undefined,
      githubUsername: githubUsername ? githubUsername.trim() : '',
      role: role || 'developer',
      organization: organization ? organization.trim() : '',
      bio: bio || '',
      avatarUrl: githubUsername 
        ? `https://github.com/${githubUsername.trim()}.png` 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=18181b&color=fafafa`,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token: `token_${newUser._id}_${Date.now()}`,
    };
  }

  /**
   * Authenticate user with dynamic credentials
   */
  static async loginUser({ email, password, githubUsername }) {
    let query = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    } else if (githubUsername) {
      query.githubUsername = githubUsername.trim();
    } else {
      throw new Error('Please provide an email or GitHub username to log in');
    }

    let user = await User.findOne(query);

    // If logging in via GitHub username and user doesn't exist yet, auto-provision
    if (!user && githubUsername) {
      user = await User.create({
        name: githubUsername.trim(),
        email: `${githubUsername.trim()}@users.noreply.github.com`,
        githubUsername: githubUsername.trim(),
        role: 'developer',
        avatarUrl: `https://github.com/${githubUsername.trim()}.png`,
      });
    }

    if (!user) {
      throw new Error('User not found. Please register first.');
    }

    if (password && user.password && user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token: `token_${user._id}_${Date.now()}`,
    };
  }

  /**
   * Get user profile by MongoDB ObjectId
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile dynamically based on request body
   */
  static async updateUser(userId, updates) {
    const allowedUpdates = ['name', 'githubUsername', 'role', 'organization', 'bio', 'avatarUrl'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (filteredUpdates.githubUsername && !updates.avatarUrl) {
      filteredUpdates.avatarUrl = `https://github.com/${filteredUpdates.githubUsername.trim()}.png`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new Error('User not found for update');
    }

    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(userId) {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new Error('User not found for deletion');
    }
    return { success: true, message: 'User account removed successfully' };
  }

  /**
   * List all registered users from MongoDB
   */
  static async listUsers(role) {
    const filter = {};
    if (role) filter.role = role;
    return await User.find(filter).select('-password').sort({ createdAt: -1 });
  }
}
