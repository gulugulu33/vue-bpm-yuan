import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import prisma from '../config/database.config';
import { User, JwtPayload } from '../types';

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}): Promise<Omit<User, 'password'>> => {
  const { username, email, password, fullName } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new Error('用户名或邮箱已存在');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'user',
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (
  username: string,
  password: string
): Promise<{ token: string; user: Omit<User, 'password'> }> => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('用户名或密码错误');
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};
