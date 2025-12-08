// src/authModel.ts
import { AuthorizationCode, Client, User, Token, RefreshToken } from 'oauth2-server';
import dotenv from 'dotenv';
import db from "../models/index";
dotenv.config();

export const authModel = {
  getAccessToken: async (accessToken: string): Promise<Token | undefined> => {
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

  getClient: async (clientId: string, clientSecret: string): Promise<Client | undefined> => {
    console.log("getClient");

    const client = await db.Client.findOne({
      where: { clientId }
    });

    return {
      id: clientId,
      grants: ['authorization_code', 'refresh_token', 'client_credentials'],
      redirectUris: client.redirectionUri,
      scope: 'read write'
    };
  },

  getRefreshToken: async (refreshToken: string): Promise<RefreshToken | undefined> => {
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

  saveToken: async (token: Token, client: Client, user: User): Promise<Token | undefined> => {
    // Save the generated token with client and user data
    console.log("saveToken");

    const tokenData = await db.Token.findOne({
      where: {
        userId: user.id
      }
    })

    if (tokenData) {
      await db.Token.update({
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
      })
    } else {

      await db.Token.create({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken, // NOTE this is only needed if you need refresh tokens down the line
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        clientId: client.id,
        userId: user.id
      })
    }

    return {
      ...token,
      client,
      user
    };
  },

  getUserFromClient: async (client: Client): Promise<User | undefined> => {
    // Return a hardcoded user for the client
    console.log("getUserFromClient");

    return { id: 'user_id' }; // Replace this with actual logic to fetch user by client if needed
  },

  getUser: async (username: string, password: string): Promise<User | undefined> => {
    // Validate the user's credentials
    console.log("getUser");

    return { id: 'user_id' }; // Replace with actual user validation logic
  },

  getAuthorizationCode: async (authorizationCode: string): Promise<AuthorizationCode | undefined> => {
    // Retrieve authorization code details
    console.log("getAuthorizationCode");
    try {
      const authorizationCodeData = await db.AuthorizationCode.findOne({
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
    } catch (error) {
      console.log(error)
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

  saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: User): Promise<AuthorizationCode | undefined> => {
    // Save the authorization code along with client and user info
    console.log("saveAuthorizationCode");
    try {
      await db.AuthorizationCode.create({
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        clientId: client.id,
        userId: user.id
      })
      return { ...code, client, user };
    } catch (error) {
      console.log(error)
      return undefined;
    }

    // return { ...code, client, user };
  },

  revokeAuthorizationCode: async (code: AuthorizationCode): Promise<boolean> => {
    // Revoke the authorization code
    console.log("revokeAuthorizationCode");
    try {
      await db.AuthorizationCode.destroy({
        where: {
          authorizationCode: code.authorizationCode
        },
      })
      return true
    } catch (error) {
      console.log(error)
      return undefined;
    }
  },

  verifyScope: async (token: Token, scope: string): Promise<boolean> => {
    // Verify if the token has the required scope
    console.log("verifyScope");

    return true;
  },

  revokeToken: async (token: Token): Promise<boolean> => {
    console.log("revokeToken");

    // Revoke the token
    return true;
  }
};
