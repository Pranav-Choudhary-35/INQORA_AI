/**
 * Wrapper function for async route handlers
 * Catches errors and passes them to error handling middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
