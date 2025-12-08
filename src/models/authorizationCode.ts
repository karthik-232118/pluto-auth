'use strict';

import { text } from "body-parser";
import { DECIMAL } from "sequelize";
import { INTEGER, STRING } from "sequelize";
import bcrypt from "bcrypt";
import _ from 'lodash';
const {
  Model
} = require('sequelize');
const PROTECTED_ATTRIBUTES = ['password']
module.exports = (sequelize, DataTypes) => {
  class AuthorizationCode extends Model {
    toJSON() {
      // hide protected fields
      let attributes = Object.assign({}, this.get())
      for (let a of PROTECTED_ATTRIBUTES) {
        delete attributes[a]
      }
      return attributes
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
  AuthorizationCode.init({
    authorizationCode: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
    redirectUri: {
      type: DataTypes.STRING
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
    modelName: 'AuthorizationCode',
  });
  return AuthorizationCode;
};
