"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
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
                uploadDir: os_1.default.tmpdir(), // Use system temp directory with better Windows handling
                maxFileSize: 100 * 1024 * 1024, // 100MB
                keepExtensions: true
            }
        }
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
