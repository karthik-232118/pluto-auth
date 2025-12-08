import crypto from "crypto";
require("dotenv").config();

const privateKey = process.env.ENCRIPTION_PRIVATE_KEY;

export const encryptedData = async (text) => {
  // Derive a key from the private key using SHA256
  const key = crypto.createHash("sha256").update(privateKey).digest();

  // Generate an initialization vector (IV)
  const iv = crypto.randomBytes(16);

  // Create a cipher using AES-256-CBC
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  // Encrypt the data
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return the encrypted data as a base64 string
  return Buffer.concat([iv, encrypted]).toString("base64");
}

export const decryptedData = async (encryptedText) => {
  try {
    // Derive the key from the private key
    const key = crypto.createHash("sha256").update(privateKey).digest();

    // Get the IV from the encrypted data
    const encryptedBuffer = Buffer.from(encryptedText, "base64");
    const iv = encryptedBuffer.slice(0, 16);
    const encrypted = encryptedBuffer.slice(16);

    // Create a decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    throw new Error("Invalid License Key");
  }
}

export default { encryptedData, decryptedData };