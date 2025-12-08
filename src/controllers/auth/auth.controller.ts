import { Request, Response, NextFunction } from "express";
import db from "../../models/index";
import response from "@utils/response";
import bcrypt from "bcrypt";
import helper from "@utils/helper";
import encryption from "@utils/encryption";
import { authModel } from '../../oauth/model';
import OAuth2Server, { Request as OAuthRequest, Response as OAuthResponse } from 'oauth2-server';
import { error } from "console";

const oauth = new OAuth2Server({
    model: authModel,
    accessTokenLifetime: 60 * 60,
    allowBearerTokensInQueryString: true,
    allowEmptyState: true
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const { UserName, Password } = req.body;
        const { p, iv } = req.body;

        const decryptedData = await helper.decryptLoginData(p, 'pluto-login-payload', iv);
        const { UserName, Password } = decryptedData;

        const user = await db.User.findOne({
            attributes: ['UserID', 'UserName', 'Password', 'UserType', 'IsActive'],
            where: { UserName: UserName, IsDeleted: false },
            include: [
                {
                    required: false,
                    model: db.Client
                }
            ]
        })
        if (user) {
            if (!user.IsActive) {
                return response.error(res, {
                    statusCode: 401,
                    message: 'User is inactive!',
                })
            }
            const passwordIsValid = bcrypt.compareSync(Password, user.Password)
            if (!passwordIsValid) {
                return response.error(res, {
                    statusCode: 401,
                    message: 'Invalid password!',
                })
            } else {
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
                           
                        }

                        const oauthRequest = new OAuthRequest(req);
                        const oauthResponse = new OAuthResponse(res);

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
                        req.body.code = authorizationCode.authorizationCode as string;

                        const oauthTokenRequest = new OAuthRequest(req);
                        const oauthTokenResponse1 = new OAuthResponse(res);
                        const token = await oauth.token(oauthTokenRequest, oauthTokenResponse1);

                        await db.UserAuthenticationLog.update({
                            LogoutDateTime: new Date().toISOString(),
                            // IsActive: false,
                        }, {
                            where: {
                                UserID: user.UserID,
                                LogoutDateTime: null
                            }
                        })
                        // await db.Token.destroy({
                        //     where: {
                        //         userId: user.UserID
                        //     }
                        // })

                        if (user.UserType != 'Admin') {
                            const keyResp = await db.sequelize.query(`
                                SELECT osl."LicenseKey"
                                FROM "OrganizationStructureLicenses" osl
                                INNER JOIN "UserOrganizationStructureLinks" uosl 
                                    ON uosl."OrganizationStructureID" = osl."OrganizationStructureID"
                                WHERE uosl."UserID" = :UserID
                                ORDER BY osl."CreatedDate" DESC
                                LIMIT 1;
                            `, {
                                type: db.sequelize.QueryTypes.SELECT,
                                replacements: {
                                    UserID: user.UserID
                                }
                            })
                            if (!keyResp?.length) {
                                return response.error(res, {
                                    statusCode: 403,
                                    message: "User don't have any license Organization!",
                                });
                            }
                            let lincense = JSON.parse(await encryption.decryptedData(keyResp[0].LicenseKey));
                            if (new Date(lincense.ValidityTo).setHours(23, 59, 59) < new Date().getTime()) {
                                return response.error(res, {
                                    statusCode: 403,
                                    message: "Your License is expired!",
                                });
                            }
                        }
                        await db.UserAuthenticationLog.create({
                            UserID: user.UserID,
                            LoginDateTime: new Date(),
                            LoginIP: req.ip,
                            BrowserInfo: req.headers['user-agent'],
                            OperatingSystemInfo: req.headers['operating-system']
                        })

                        // console.log('token', token);

                        return response.success(res, {
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


                    } else {
                        return response.error(res, {
                            statusCode: 401,
                            message: 'Invalid redirection url!',
                            errors: {
                                redirectionUri: `${req.protocol}://${req.headers.host}`,
                                requestUrl: `${req.protocol}://${req.headers.origin}`
                            }
                        })
                    }
                } else {
                    return response.error(res, {
                        statusCode: 401,
                        message: 'No redirection url found!'
                    })
                }
            }
        } else {
            return response.error(res, {
                statusCode: 400,
                message: "User does not exist",
            });
        }
    } catch (err:any) {
        console.log(err);
        return response.error(res, {
            statusCode: 500,
            message: err?.message ? err.message : "Something went wrong!",
        });
    }
};

const loginCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query;
        if (code) {
            console.log('code', code);

            const authorizationCode = await db.AuthorizationCode.findOne({
                attributes: ['clientId', 'userId', 'redirectUri'],
                where: { authorizationCode: code }
            });

            const client = await db.Client.findOne({
                attributes: ['clientId', 'clientSecret'],
                where: { clientId: authorizationCode.clientId }
            });

            const oauthRequest = new OAuthRequest(req);
            const oauthResponse = new OAuthResponse(res);

            // Request the token using the OAuth server's `token` method
            const token = await oauth.token(oauthRequest, oauthResponse);

            // const user = await db.User.findOne({
            //     attributes: ['UserID', 'UserName'],
            //     where: { UserID: req.body.user }
            // });

        } else {
            return response.error(res, {
                statusCode: 400,
                message: "Invalid code",
            });
        }
    } catch (err:any) {
        console.log(err);
        return response.error(res, {
            statusCode: 500,
            message:  err?.message ? err.message : "Something went wrong!",
        });
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers['authorization'].split(' ')[1];
        console.log('accessToken', accessToken);

        const oauthRequest = new OAuthRequest(req);
        const oauthResponse = new OAuthResponse(res);
        const tt = await oauth.authenticate(oauthRequest, oauthResponse);
        console.log('tt', tt);

        return response.success(res, {
            statusCode: 200,
            message: "User logged out successfully!",
        });
    } catch (err) {
        console.log(err);
        return response.error(res, {
            statusCode: 500,
            message: "Something went wrong!",
        });
    }
}

const generateCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = new OAuthRequest(req);
        const response = new OAuthResponse(res);

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

    } catch (err) {
        console.log(err);
        return response.error(res, {
            statusCode: 500,
            message: "Something went wrong!",
        });
    }


};

export const generateTokaen = async (req: Request, res: Response, next: NextFunction) => {
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



        const oauthRequest = new OAuthRequest(req);
        const oauthResponse = new OAuthResponse(res);

        oauth
            .token(oauthRequest, oauthResponse)
            .then((token) => res.json(token))
            .catch((err) => {
                console.log('OAuth2 token generation error:', err); // Log OAuth2 errors
                res.status(err.code || 500).json(err);
            });
    } catch (err) {
        console.log(err);
        return response.error(res, {
            statusCode: 500,
            message: "Something went wrong!",
        });
    }


};



export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const oauthRequest = new OAuthRequest(req);
    const oauthResponse = new OAuthResponse(res);

    // oauth
    //   .authenticate(oauthRequest, oauthResponse)
    //   .then((token) => {
    //     res.json({ message: 'This is a secure endpoint' })
    //   })
    //   .catch((err) => res.status(err.code || 500).json(err));
};



export default {
    // authorizeLogin,
    generateTokaen,
    authenticate,
    login,
    loginCallback,
    logout,
}