'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const { Model } = require('sequelize');
const PROTECTED_ATTRIBUTES = ['password'];
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
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
            User.belongsTo(models.Client, { foreignKey: 'ClientId' });
        }
    }
    User.init({
        UserID: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        UserName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ClientId: {
            type: DataTypes.UUID
        },
        UserType: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['Admin', 'ProcessOwner', 'EndUser'],
            defaultValue: 'EndUser'
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        IsDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
        modelName: 'User',
    });
    return User;
};
