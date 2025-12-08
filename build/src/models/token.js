'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const { Model } = require('sequelize');
const PROTECTED_ATTRIBUTES = ['password'];
module.exports = (sequelize, DataTypes) => {
    class Token extends Model {
        toJSON() {
            // hide protected fields
            let attributes = Object.assign({}, this.get());
            for (let a of PROTECTED_ATTRIBUTES) {
                delete attributes[a];
            }
            return attributes;
        }
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Token.init({
        tokenId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        accessToken: {
            type: DataTypes.STRING,
        },
        accessTokenExpiresAt: {
            type: DataTypes.DATE
        },
        refreshToken: {
            type: DataTypes.STRING
        },
        refreshTokenExpiresAt: {
            type: DataTypes.DATE
        },
        clientId: {
            type: DataTypes.UUID
        },
        userId: {
            type: DataTypes.UUID
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        modelName: 'Token',
    });
    return Token;
};
