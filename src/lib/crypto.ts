const STORAGE_KEY = "giftly-enc-key";
const ALGO = "AES-GCM";

async function getEncryptionKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const jwk = JSON.parse(stored) as JsonWebKey;
    return crypto.subtle.importKey("jwk", jwk, ALGO, true, [
      "encrypt",
      "decrypt",
    ]);
  }
  const key = await crypto.subtle.generateKey(
    { name: ALGO, length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jwk));
  return key;
}

export async function encryptCode(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encoded,
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}:${ctB64}`;
}

export async function decryptCode(encrypted: string): Promise<string> {
  const parts = encrypted.split(":");
  if (parts.length !== 2) return encrypted;
  try {
    const key = await getEncryptionKey();
    const iv = Uint8Array.from(atob(parts[0]!), (c) => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(parts[1]!), (c) =>
      c.charCodeAt(0),
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return encrypted;
  }
}
