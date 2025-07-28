"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.default = [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    {
        name: 'strapi::body',
        config: {
            formidable: {
                uploadDir: path_1.default.join(__dirname, '../tmp'),
                maxFileSize: 100 * 1024 * 1024, // 100MB
                keepExtensions: true
            }
        }
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
