import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AUTH } from '../../constants/auth.js';
import { MESSAGES } from '../../constants/messages.js';
import { AppError } from '../../utils/AppError.js';
import * as authRepository from './auth.repository.js';

/**
 * Service auth: register, login, dan memeriksa token.
 *
 * Alur singkat:
 *   1. Register/login berhasil → server membuat JWT berisi id user (`sub`), ditandatangani JWT_SECRET.
 *   2. Frontend menyimpan token lalu mengirimnya di setiap request: Authorization: Bearer <token>.
 *   3. Middleware requireAuth memanggil getUserFromToken() untuk memastikan token asli & belum kedaluwarsa.
 */

function createToken(user) {
  return jwt.sign({ sub: String(user.id) }, env.auth.jwtSecret, { expiresIn: env.auth.jwtExpiresIn });
}

/** Jangan pernah mengirim password_hash ke klien. */
function toPublicUser({ password_hash: _passwordHash, ...user }) {
  return user;
}

export async function register({ name, email, password }) {
  if (await authRepository.existsByEmail(email)) {
    throw AppError.conflict(MESSAGES.EMAIL_TAKEN, [{ field: 'email', message: MESSAGES.EMAIL_TAKEN }]);
  }

  const passwordHash = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);
  const id = await authRepository.create({ name, email, password_hash: passwordHash });
  const user = await authRepository.findById(id);

  // Setelah register langsung dianggap login, supaya pengguna tidak perlu login ulang.
  return { user, token: createToken(user) };
}

export async function login({ email, password }) {
  const user = await authRepository.findByEmailWithPassword(email);
  const isValid = user ? await bcrypt.compare(password, user.password_hash) : false;

  // Pesan sengaja sama untuk "email tidak terdaftar" dan "password salah",
  // supaya orang lain tidak bisa menebak email mana yang terdaftar.
  if (!isValid) throw AppError.unauthorized(MESSAGES.INVALID_CREDENTIALS);

  return { user: toPublicUser(user), token: createToken(user) };
}

/** Memverifikasi token dan mengembalikan user-nya. Gagal → 401. */
export async function getUserFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.auth.jwtSecret);
  } catch (error) {
    const message = error instanceof jwt.TokenExpiredError ? MESSAGES.SESSION_EXPIRED : MESSAGES.UNAUTHENTICATED;
    throw AppError.unauthorized(message);
  }

  // User bisa saja sudah dihapus setelah token dibuat
  const user = await authRepository.findById(Number(payload.sub));
  if (!user) throw AppError.unauthorized(MESSAGES.UNAUTHENTICATED);
  return user;
}
