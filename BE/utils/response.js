exports.successResponse = (res = {}, statusCode = 200, data = {}) => {
  res.status(statusCode).json({
    success: [200, 201].includes(statusCode),
    data,
  });
};
