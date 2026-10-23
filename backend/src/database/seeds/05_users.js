import bcrypt from 'bcryptjs';
import { AUTH } from '../../constants/auth.js';

/**
 * Akun demo untuk presentasi & pengembangan lokal (FIKTIF, bukan akun sungguhan).
 * Kredensialnya juga dicantumkan di README bagian "Akun demo".
 * Jangan dipakai di server production tanpa diganti.
 */
const DEMO_USER = {
  name: 'Admin Demo',
  email: 'admin@pooltrack.example',
  password: 'pooltrack123',
};

export async function seed(knex) {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, AUTH.BCRYPT_SALT_ROUNDS);
  await knex('users').insert({ name: DEMO_USER.name, email: DEMO_USER.email, password_hash: passwordHash });
}
