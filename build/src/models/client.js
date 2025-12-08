'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const { Model } = require('sequelize');
const PROTECTED_ATTRIBUTES = ['password'];
module.exports = (sequelize, DataTypes) => {
    class Client extends Model {
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
    Client.init({
        name: {
            type: DataTypes.STRING
        },
        clientId: {
            type: DataTypes.UUID,
        },
        clientSecret: {
            type: DataTypes.UUID
        },
        redirectionUri: {
            type: DataTypes.JSONB
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
        modelName: 'Client',
    });
    return Client;
};
