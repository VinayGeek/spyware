exports.successResponse = (
  res = {},
  statusCode = 200,
  message = "Ok",
  data = {}
) => {
  res.status(statusCode).json({
    success: [200, 201].includes(statusCode),
    message,
    data,
  });
};
