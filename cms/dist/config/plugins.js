"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    upload: {
        config: {
            sizeLimit: 100 * 1024 * 1024, // 100MB in bytes
            breakpoints: {
                xlarge: 1920,
                large: 1000,
                medium: 750,
                small: 500,
                xsmall: 64
            },
            // Disable image optimization to prevent Windows temp file issues
            sizeOptimization: false,
            responsive: false,
        },
    },
});
