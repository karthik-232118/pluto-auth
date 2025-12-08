const success = (res: any, obj: any) => {
  const { statusCode, message, data = null } = obj;
  return res.status(statusCode).json({ status: true, message, data });
};

const error = (res: any, e): any => {
  const { statusCode, message, errors } = e;
  return res.status(statusCode).json({ status: false, message, errors });
};

export default { success, error };
