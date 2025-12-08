"use strict";
require("dotenv").config();
const CONFIG = {}; // Make this global to use all over the application
CONFIG.app = process.env.APP_ENV; //production or development
CONFIG.port = process.env.APP_PORT;
module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_CONNECTION,
        dialectOptions: {
            application_name: "Pluto auth Staging",
            idle_in_transaction_session_timeout: 60000,
            allowPublicKeyRetrieval: true, // Enable public key retrieval
            ssl: process.env.DB_CONNECTION === 'postgres' ? false : {
                rejectUnauthorized: false, // Disable SSL verification if no CA certificate is available
            },
        },
        pool: {
            handleDisconnects: true,
            max: 1000,
            min: 1,
            idle: 10000,
            acquire: 120000,
            evict: 10000,
        },
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_PROD_USERNAME,
        password: process.env.DB_PROD_PASSWORD,
        database: process.env.DB_PROD_DATABASE,
        host: process.env.DB_PROD_HOST,
        port: process.env.DB_PROD_PORT,
        dialect: process.env.DB_PROD_CONNECTION,
        dialectOptions: {
            application_name: "Pluto auth Production",
            idle_in_transaction_session_timeout: 60000,
            allowPublicKeyRetrieval: true, // Enable public key retrieval
            ssl: {
                rejectUnauthorized: false, // Disable SSL verification if no CA certificate is available
            },
        },
        pool: {
            handleDisconnects: true,
            max: 1000,
            min: 1,
            idle: 60000,
            acquire: 120000,
        },
    },
    CONFIG,
};
