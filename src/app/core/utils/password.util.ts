/**
 * Hash de senha para o cadastro/login local.
 *
 * IMPORTANTE — leia antes de reaproveitar isso em outro projeto:
 * Isso NÃO é criptografia forte. É só um hash determinístico (djb2) para
 * evitar que a senha fique gravada em texto puro dentro do LocalStorage do
 * navegador. Como todo o "banco de dados" deste app é o próprio
 * LocalStorage do cliente (não existe backend/servidor aqui), não tem como
 * ter segurança de verdade — qualquer pessoa com acesso ao navegador
 * consegue ver os dados. Num projeto com backend real, a senha deve ser
 * validada e hasheada no servidor com bcrypt/argon2, nunca no cliente.
 */
export function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  // Converte pra string sem sinal, só por estética (não afeta a "segurança").
  return (hash >>> 0).toString(16);
}
