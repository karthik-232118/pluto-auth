"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authModel = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("../models/index"));
dotenv_1.default.config();
exports.authModel = {
    getAccessToken: async (accessToken) => {
        console.log("getAccessToken");
        return {
            accessToken,
            accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
            client: {
                id: 'client_id',
                grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials']
            },
            user: { id: 'user_id' },
            scope: 'read write'
        };
    },
    getClient: async (clientId, clientSecret) => {
        console.log("getClient");
        const client = await index_1.default.Client.findOne({
            where: { clientId }
        });
        return {
            id: clientId,
            grants: ['authorization_code', 'refresh_token', 'client_credentials'],
            redirectUris: client.redirectionUri,
            scope: 'read write'
        };
    },
    getRefreshToken: async (refreshToken) => {
        // Replace this with your actual database lookup for refresh tokens
        console.log("getRefreshToken");
        return {
            refreshToken,
            refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // e.g., 30 days expiration
            client: {
                id: 'client_id',
                grants: ['refresh_token', 'client_credentials']
            },
            user: { id: 'user_id' }
        };
    },
    saveToken: async (token, client, user) => {
        // Save the generated token with client and user data
        console.log("saveToken");
        const tokenData = await index_1.default.Token.findOne({
            where: {
                userId: user.id
            }
        });
        if (tokenData) {
            await index_1.default.Token.update({
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.accessTokenExpiresAt,
                refreshToken: token.refreshToken, // NOTE this is only needed if you need refresh tokens down the line
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                clientId: client.id,
                userId: user.id
            }, {
                where: {
                    userId: user.id
                }
            });
        }
        else {
            await index_1.default.Token.create({
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.accessTokenExpiresAt,
                refreshToken: token.refreshToken, // NOTE this is only needed if you need refresh tokens down the line
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                clientId: client.id,
                userId: user.id
            });
        }
        return {
            ...token,
            client,
            user
        };
    },
    getUserFromClient: async (client) => {
        // Return a hardcoded user for the client
        console.log("getUserFromClient");
        return { id: 'user_id' }; // Replace this with actual logic to fetch user by client if needed
    },
    getUser: async (username, password) => {
        // Validate the user's credentials
        console.log("getUser");
        return { id: 'user_id' }; // Replace with actual user validation logic
    },
    getAuthorizationCode: async (authorizationCode) => {
        // Retrieve authorization code details
        console.log("getAuthorizationCode");
        try {
            const authorizationCodeData = await index_1.default.AuthorizationCode.findOne({
                where: {
                    authorizationCode: authorizationCode
                },
                attributes: ['authorizationCode', 'expiresAt', 'redirectUri', 'clientId', 'userId'],
            });
            return {
                authorizationCode: authorizationCodeData.authorizationCode,
                expiresAt: authorizationCodeData.expiresAt,
                redirectUri: authorizationCodeData.redirectUri,
                client: {
                    id: authorizationCodeData.clientId,
                    grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials'],
                },
                user: {
                    id: authorizationCodeData.userId,
                },
            };
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
        // return {
        //   authorizationCode,
        //   expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes expiration
        //   redirectUri: 'http://localhost:9017/api/v1/auth/login-callback',
        //   client: {
        //     id: 'client_id',
        //     grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials'] // Include the supported grants
        //   },
        //   user: { id: 'user_id' }
        // };
    },
    saveAuthorizationCode: async (code, client, user) => {
        // Save the authorization code along with client and user info
        console.log("saveAuthorizationCode");
        try {
            await index_1.default.AuthorizationCode.create({
                authorizationCode: code.authorizationCode,
                expiresAt: code.expiresAt,
                redirectUri: code.redirectUri,
                clientId: client.id,
                userId: user.id
            });
            return { ...code, client, user };
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
        // return { ...code, client, user };
    },
    revokeAuthorizationCode: async (code) => {
        // Revoke the authorization code
        console.log("revokeAuthorizationCode");
        try {
            await index_1.default.AuthorizationCode.destroy({
                where: {
                    authorizationCode: code.authorizationCode
                },
            });
            return true;
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    },
    verifyScope: async (token, scope) => {
        // Verify if the token has the required scope
        console.log("verifyScope");
        return true;
    },
    revokeToken: async (token) => {
        console.log("revokeToken");
        // Revoke the token
        return true;
    }
};
