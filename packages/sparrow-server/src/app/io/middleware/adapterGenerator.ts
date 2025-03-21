export default app => {
  const logger = app.getLogger();

  return async (ctx, next) => {
    const { packet } = ctx;
    const [ eventName, args, callback ] = packet;
    const [ namespace, moduleName, methodName ] = eventName.split('.');
    if (namespace === 'generator') {
      try {
        const { generator } = app;
        callback(null, await generator[moduleName][methodName](args, ctx));
      } catch (error) {
        callback({
          code: error.code,
          message: error.message,
        });
      }

    }
    await next();
  };
};