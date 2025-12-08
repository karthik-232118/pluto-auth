import { first } from "lodash";
import db from "../models/index";
import forge from 'node-forge';
import fs from 'fs';

const privateKeyPem = fs.readFileSync('./pluto_private_key.pem', 'utf8');
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

const getLimitAndOffset = (page: any, pageSize: any) => {
  page = page ? page : 1;
  pageSize = pageSize ? pageSize : 10;
  const limit = parseInt(pageSize);
  const offset = (parseInt(page) - 1) * pageSize;
  return { limit, offset, pageSize };
};

const pagination = async (page: any, pageSize: any, total: any) => {
  let pagesize: any,
    offset: any,
    previouspage: any,
    nextpage: any,
    totalPages: any;
  page = page ? parseInt(page) : 1;
  pageSize = pageSize ? pageSize : 10;
  pagesize = parseInt(pageSize);
  previouspage = page <= 1 ? null : page - 1;
  nextpage = total / pagesize > page ? page + 1 : null;
  totalPages = total < pageSize ? 1 : Math.ceil(total / pageSize);

  return {
    previousPage: previouspage,
    currentPage: page,
    nextPage: nextpage,
    total: total,
    totalPages: totalPages,
    pageSize: pagesize,
    offset: offset,
  };
};

export const sorting = (sortField = "createdAt", sortOrder = "ASC") => {
  return [sortField, sortOrder];
};

export const decryptLoginData = async (encryptedPayload: string, secretKey: string, iv: string) => {
  try {
      // Decode and decrypt the AES secret key using RSA private key
      // const encryptedSecretKeyBytes = forge.util.decode64(encryptedSecretKey);
      // const secretKey = privateKey.decrypt(encryptedSecretKeyBytes, 'RSA-OAEP');

      // Decode and decrypt the AES-encrypted payload
      const formattedSecretKey = forge.util.createBuffer(secretKey.padEnd(16, ' ').slice(0, 16)).getBytes();
      const encryptedPayloadBytes = forge.util.decode64(encryptedPayload);
      const decipher = forge.cipher.createDecipher('AES-CBC', formattedSecretKey);

      // Set the initialization vector (IV) — should match the IV used in encryption
      // const iv = forge.random.getBytesSync(16); // Replace with the actual IV if shared with the client
      decipher.start({ iv });
      decipher.update(forge.util.createBuffer(encryptedPayloadBytes));
      decipher.finish();

      // Parse decrypted data as JSON
      const decryptedData = JSON.parse(decipher.output.toString());
      return decryptedData;
  } catch (error) {
      console.error('Error during decryption:', error);
      throw new Error('Decryption failed');
  }
}

export default { getLimitAndOffset, pagination, sorting, decryptLoginData };
