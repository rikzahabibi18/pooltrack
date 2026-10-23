export const AUTH = Object.freeze({
  /** Tingkat kerumitan hash bcrypt (10 = standar umum: aman & tetap cepat). */
  BCRYPT_SALT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 8,
  /** bcrypt hanya memakai 72 byte pertama password; lebih dari itu ditolak supaya tidak menyesatkan. */
  PASSWORD_MAX_LENGTH: 72,
  /** Format header: Authorization: Bearer <token> */
  BEARER_PREFIX: 'Bearer ',
});
