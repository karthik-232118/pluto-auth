"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.generateTokaen = exports.logout = exports.login = void 0;
const index_1 = __importDefault(require("../../models/index"));
const response_1 = __importDefault(require("@utils/response"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const helper_1 = __importDefault(require("@utils/helper"));
const encryption_1 = __importDefault(require("@utils/encryption"));
const model_1 = require("../../oauth/model");
const oauth2_server_1 = __importStar(require("oauth2-server"));
const oauth = new oauth2_server_1.default({
    model: model_1.authModel,
    accessTokenLifetime: 60 * 60,
    allowBearerTokensInQueryString: true,
    allowEmptyState: true
});
const login = async (req, res, next) => {
    try {
        // const { UserName, Password } = req.body;
        const { p, iv } = req.body;
        const decryptedData = await helper_1.default.decryptLoginData(p, 'pluto-login-payload', iv);
        const { UserName, Password } = decryptedData;
        const user = await index_1.default.User.findOne({
            attributes: ['UserID', 'UserName', 'Password', 'UserType', 'IsActive'],
            where: { UserName: UserName, IsDeleted: false },
            include: [
                {
                    required: false,
                    model: index_1.default.Client
                }
            ]
        });
        if (user) {
            if (!user.IsActive) {
                return response_1.default.error(res, {
                    statusCode: 401,
                    message: 'User is inactive!',
                });
            }
            const passwordIsValid = bcrypt_1.default.compareSync(Password, user.Password);
            if (!passwordIsValid) {
                return response_1.default.error(res, {
                    statusCode: 401,
                    message: 'Invalid password!',
                });
            }
            else {
                if (user.Client && user.Client.clientId && user.Client.clientSecret && user.Client.redirectionUri && user.Client.redirectionUri.length > 0) {
                    if (user.Client.redirectionUri.includes(`${req.headers.origin}`)) {
                        req.body = {
                            grant_type: 'authorization_code',
                            client_id: user.Client.clientId,
                            client_secret: user.Client.clientSecret,
                            response_type: 'code',
                            redirect_uri: `${req.headers.origin}`,
                            // redirect_uri: `${req.protocol}://${req.headers.host}/api/v1/auth/login-callback`,
                            scope: 'read write',
                        };
                        const oauthRequest = new oauth2_server_1.Request(req);
                        const oauthResponse = new oauth2_server_1.Response(res);
                        const authorizationCode = await oauth.authorize(oauthRequest, oauthResponse, {
                            authenticateHandler: {
                                handle: () => {
                                    return { id: user.UserID };
                                },
                            },
                        });
                        const redirectUri = `${authorizationCode.redirectUri}`;
                        // return res.redirect(redirectUri);
                        req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                        req.body.code = authorizationCode.authorizationCode;
                        const oauthTokenRequest = new oauth2_server_1.Request(req);
                        const oauthTokenResponse1 = new oauth2_server_1.Response(res);
                        const token = await oauth.token(oauthTokenRequest, oauthTokenResponse1);
                        await index_1.default.UserAuthenticationLog.update({
                            LogoutDateTime: new Date().toISOString(),
                            // IsActive: false,
                        }, {
                            where: {
                                UserID: user.UserID,
                                LogoutDateTime: null
                            }
                        });
                        // await db.Token.destroy({
                        //     where: {
                        //         userId: user.UserID
                        //     }
                        // })
                        if (user.UserType != 'Admin') {
                            const keyResp = await index_1.default.sequelize.query(`
                                SELECT osl."LicenseKey"
                                FROM "OrganizationStructureLicenses" osl
                                INNER JOIN "UserOrganizationStructureLinks" uosl 
                                    ON uosl."OrganizationStructureID" = osl."OrganizationStructureID"
                                WHERE uosl."UserID" = :UserID
                                ORDER BY osl."CreatedDate" DESC
                                LIMIT 1;
                            `, {
                                type: index_1.default.sequelize.QueryTypes.SELECT,
                                replacements: {
                                    UserID: user.UserID
                                }
                            });
                            if (!keyResp?.length) {
                                return response_1.default.error(res, {
                                    statusCode: 403,
                                    message: "User don't have any license Organization!",
                                });
                            }
                            let lincense = JSON.parse(await encryption_1.default.decryptedData(keyResp[0].LicenseKey));
                            if (new Date(lincense.ValidityTo).setHours(23, 59, 59) < new Date().getTime()) {
                                return response_1.default.error(res, {
                                    statusCode: 403,
                                    message: "Your License is expired!",
                                });
                            }
                        }
                        await index_1.default.UserAuthenticationLog.create({
                            UserID: user.UserID,
                            LoginDateTime: new Date(),
                            LoginIP: req.ip,
                            BrowserInfo: req.headers['user-agent'],
                            OperatingSystemInfo: req.headers['operating-system']
                        });
                        // console.log('token', token);
                        return response_1.default.success(res, {
                            statusCode: 200,
                            data: {
                                access_token: token.accessToken,
                                access_token_expiresAt: token.accessTokenExpiresAt,
                                refresh_token: token.refreshToken,
                                refresh_token_expiresAt: token.refreshTokenExpiresAt,
                                userId: user.UserID,
                                user_type: user.UserType,
                            }
                        });
                    }
                    else {
                        return response_1.default.error(res, {
                            statusCode: 401,
                            message: 'Invalid redirection url!',
                            errors: {
                                redirectionUri: `${req.protocol}://${req.headers.host}`,
                                requestUrl: `${req.protocol}://${req.headers.origin}`
                            }
                        });
                    }
                }
                else {
                    return response_1.default.error(res, {
                        statusCode: 401,
                        message: 'No redirection url found!'
                    });
                }
            }
        }
        else {
            return response_1.default.error(res, {
                statusCode: 400,
                message: "User does not exist",
            });
        }
    }
    catch (err) {
        console.log(err);
        return response_1.default.error(res, {
            statusCode: 500,
            message: err?.message ? err.message : "Something went wrong!",
        });
    }
};
exports.login = login;
const loginCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (code) {
            console.log('code', code);
            const authorizationCode = await index_1.default.AuthorizationCode.findOne({
                attributes: ['clientId', 'userId', 'redirectUri'],
                where: { authorizationCode: code }
            });
            const client = await index_1.default.Client.findOne({
                attributes: ['clientId', 'clientSecret'],
                where: { clientId: authorizationCode.clientId }
            });
            const oauthRequest = new oauth2_server_1.Request(req);
            const oauthResponse = new oauth2_server_1.Response(res);
            // Request the token using the OAuth server's `token` method
            const token = await oauth.token(oauthRequest, oauthResponse);
            // const user = await db.User.findOne({
            //     attributes: ['UserID', 'UserName'],
            //     where: { UserID: req.body.user }
            // });
        }
        else {
            return response_1.default.error(res, {
                statusCode: 400,
                message: "Invalid code",
            });
        }
    }
    catch (err) {
        console.log(err);
        return response_1.default.error(res, {
            statusCode: 500,
            message: err?.message ? err.message : "Something went wrong!",
        });
    }
};
const logout = async (req, res, next) => {
    try {
        const accessToken = req.headers['authorization'].split(' ')[1];
        console.log('accessToken', accessToken);
        const oauthRequest = new oauth2_server_1.Request(req);
        const oauthResponse = new oauth2_server_1.Response(res);
        const tt = await oauth.authenticate(oauthRequest, oauthResponse);
        console.log('tt', tt);
        return response_1.default.success(res, {
            statusCode: 200,
            message: "User logged out successfully!",
        });
    }
    catch (err) {
        console.log(err);
        return response_1.default.error(res, {
            statusCode: 500,
            message: "Something went wrong!",
        });
    }
};
exports.logout = logout;
const generateCode = async (req, res, next) => {
    try {
        const request = new oauth2_server_1.Request(req);
        const response = new oauth2_server_1.Response(res);
        console.log(request.body);
        const authorizationCode = await oauth.authorize(request, response, {
            authenticateHandler: {
                handle: () => {
                    // Replace this with actual user authentication logic
                    return { id: 'user_id' };
                },
            },
        });
        // Return authorization code as JSON
        res.json({ code: authorizationCode.authorizationCode });
    }
    catch (err) {
        console.log(err);
        return response_1.default.error(res, {
            statusCode: 500,
            message: "Something went wrong!",
        });
    }
};
const generateTokaen = async (req, res, next) => {
    console.log('generateToken function called'); // Initial log
    try {
        // oauthServer.authorize({
        //     authenticateHandler: {
        //         handle: req => {
        //             return req.body.user
        //         },
        //     },
        // })
        // return
        const oauthRequest = new oauth2_server_1.Request(req);
        const oauthResponse = new oauth2_server_1.Response(res);
        oauth
            .token(oauthRequest, oauthResponse)
            .then((token) => res.json(token))
            .catch((err) => {
            console.log('OAuth2 token generation error:', err); // Log OAuth2 errors
            res.status(err.code || 500).json(err);
        });
    }
    catch (err) {
        console.log(err);
        return response_1.default.error(res, {
            statusCode: 500,
            message: "Something went wrong!",
        });
    }
};
exports.generateTokaen = generateTokaen;
const authenticate = (req, res, next) => {
    const oauthRequest = new oauth2_server_1.Request(req);
    const oauthResponse = new oauth2_server_1.Response(res);
    // oauth
    //   .authenticate(oauthRequest, oauthResponse)
    //   .then((token) => {
    //     res.json({ message: 'This is a secure endpoint' })
    //   })
    //   .catch((err) => res.status(err.code || 500).json(err));
};
exports.authenticate = authenticate;
exports.default = {
    // authorizeLogin,
    generateTokaen: exports.generateTokaen,
    authenticate: exports.authenticate,
    login: exports.login,
    loginCallback,
    logout: exports.logout,
};
