import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function signupUser(userData) {
  const { name, email, password, city, favoriteTeam, plan } = userData;

  // Check if user already exists
  const existingUser = await kv.get(`user:${email}`);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user profile
  const userProfile = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    city,
    credits: 0, // Default credits
    profilePicture: null, // Default to null, can be updated later
    favoriteTeam,
    plan,
    createdAt: new Date().toISOString(),
  };

  // Save user profile to Vercel KV
  await kv.set(`user:${email}`, JSON.stringify(userProfile));

  // Return the user profile (excluding the password)
  const { password: _, ...userWithoutPassword } = userProfile;
  return userWithoutPassword;
}
