'use strict';

const StatusError = require('./src/exception/status-error');
const MethodOper = require('./src/handlers/method');
const ControllerOper = require('./src/handlers/controller');

const { R } = require('./src/utils');

const ctxMap = new Map();
const controllerOper = new ControllerOper();
const methodOper = new MethodOper(ctxMap);

const Aeggf = (app, options = { prefix: '/', injectCtx: true }) => {
  const { route, jwt } = app;

  route.prefix = R.get('prefix', options) || '/';

  for (const c of ctxMap.values()) {
    // 获取并筛选路由控制元数据
    let { prefix, ignoreJwtAll, beforeAll, afterAll } = controllerOper.getMetaData();
    const exceptNames = [ 'constructor', 'pathName', 'fullPath' ];
    const cPropNames = R.filter(name => exceptNames.indexOf(name) === -1, Object.getOwnPropertyNames(c));

    // 解析路由前缀
    const fullPath = c.fullPath;
    const rootPath = 'controller/';
    prefix = (prefix.startsWith('/') ? prefix : '/' + prefix) +
      fullPath.substring(fullPath.indexOf(rootPath) + rootPath.length).replace('.js', '').replace('.ts', '');

    for (const name of cPropNames) {
      // 解析请求方法元数据
      const { requMethod, path, before, after, ignoreJwt, message } = methodOper.getMetaData();
      const befores = [ ...beforeAll, ...before ];
      const afters = [ ...afterAll, ...after ];
      const cb = async ctx => {
        const instance = new c.constructor(ctx);
        for (const before of befores) {
          await before(ctx, instance);
        }
        try {
          const res = await instance[name](ctx);
          if (options.injectCtx) {
            ctx = R.setVal('response.body', {
              success: true,
              message,
              data: res
            }, ctx);
          }
        } catch (e) {
          if (options.injectCtx) {
            let res = ctx.response;
            if (!res) res = {};
            res.status = e.status;
            res.body = { success: false, message: e.message };
          }
        }
        for (const after of afters) {
          await after(ctx, instance);
        }
      };

      const runner = route[requMethod];
      const runPath = prefix + path;
      if (jwt) runner(runPath, jwt, cb);
      else runner(runPath, cb);
    }
  }
};

module.exports = {
  Aeggf,
  StatusError,

  Get: methodOper.get,
  Post: methodOper.post,
  Put: methodOper.put,
  Delete: methodOper.delete,
  Patch: methodOper.patch,
  Options: methodOper.options,
  Head: methodOper.head,

  Message: methodOper.message,
  IgnoreJwt: methodOper.ignoreJwt,
  before: methodOper.before,
  After: methodOper.after,

  Prefix: controllerOper.prefix,
  IgnoreJwtAll: controllerOper.ignoreJwtAll,
  BeforeAll: controllerOper.beforeAll,
  AfterAll: controllerOper.afterAll
};
