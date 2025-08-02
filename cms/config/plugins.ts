export default ({ env }) => ({
  upload: {
    config: {
      sizeLimit: 100 * 1024 * 1024, // 100MB in bytes
      // Completely disable image processing to prevent Windows EPERM errors
      sizeOptimization: false,
      responsive: false,
      breakpoints: {},
    },
  },
});
