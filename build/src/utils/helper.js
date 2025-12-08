"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptLoginData = exports.sorting = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
const fs_1 = __importDefault(require("fs"));
const privateKeyPem = fs_1.default.readFileSync('./pluto_private_key.pem', 'utf8');
const privateKey = node_forge_1.default.pki.privateKeyFromPem(privateKeyPem);
const getLimitAndOffset = (page, pageSize) => {
    page = page ? page : 1;
    pageSize = pageSize ? pageSize : 10;
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * pageSize;
    return { limit, offset, pageSize };
};
const pagination = async (page, pageSize, total) => {
    let pagesize, offset, previouspage, nextpage, totalPages;
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
const sorting = (sortField = "createdAt", sortOrder = "ASC") => {
    return [sortField, sortOrder];
};
exports.sorting = sorting;
const decryptLoginData = async (encryptedPayload, secretKey, iv) => {
    try {
        // Decode and decrypt the AES secret key using RSA private key
        // const encryptedSecretKeyBytes = forge.util.decode64(encryptedSecretKey);
        // const secretKey = privateKey.decrypt(encryptedSecretKeyBytes, 'RSA-OAEP');
        // Decode and decrypt the AES-encrypted payload
        const formattedSecretKey = node_forge_1.default.util.createBuffer(secretKey.padEnd(16, ' ').slice(0, 16)).getBytes();
        const encryptedPayloadBytes = node_forge_1.default.util.decode64(encryptedPayload);
        const decipher = node_forge_1.default.cipher.createDecipher('AES-CBC', formattedSecretKey);
        // Set the initialization vector (IV) — should match the IV used in encryption
        // const iv = forge.random.getBytesSync(16); // Replace with the actual IV if shared with the client
        decipher.start({ iv });
        decipher.update(node_forge_1.default.util.createBuffer(encryptedPayloadBytes));
        decipher.finish();
        // Parse decrypted data as JSON
        const decryptedData = JSON.parse(decipher.output.toString());
        return decryptedData;
    }
    catch (error) {
        console.error('Error during decryption:', error);
        throw new Error('Decryption failed');
    }
};
exports.decryptLoginData = decryptLoginData;
exports.default = { getLimitAndOffset, pagination, sorting: exports.sorting, decryptLoginData: exports.decryptLoginData };
