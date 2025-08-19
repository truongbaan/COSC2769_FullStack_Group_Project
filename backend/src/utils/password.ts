import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export function comparePassword(password: string, hash: string): boolean {
  try {
    const isMatch = bcrypt.compareSync(password, hash);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    throw error;
  }
}

export function hashPassword(password: string): string {
  try {
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}