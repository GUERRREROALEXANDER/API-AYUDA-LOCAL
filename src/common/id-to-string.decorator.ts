import { Transform } from 'class-transformer';

// Acepta un ID enviado como numero (3) o como texto ("3"): las respuestas devuelven
// IDs numericos, asi que un cliente puede reenviarlos tal cual sin recibir un 400.
export const IdToString = () =>
  Transform(({ value }) => (typeof value === 'number' ? String(value) : value));
