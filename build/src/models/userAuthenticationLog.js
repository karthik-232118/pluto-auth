'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const { Model } = require('sequelize');
const PROTECTED_ATTRIBUTES = ['password'];
module.exports = (sequelize, DataTypes) => {
    class UserAuthenticationLog extends Model {
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
    UserAuthenticationLog.init({
        UserID: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        LoginDateTime: {
            type: DataTypes.DATE,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.NOW
        },
        LogoutDateTime: {
            type: DataTypes.DATE
        },
        LoginIP: {
            type: DataTypes.STRING
        },
        BrowserInfo: {
            type: DataTypes.STRING
        },
        OperatingSystemInfo: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'UserAuthenticationLog',
        timestamps: false
    });
    return UserAuthenticationLog;
};
