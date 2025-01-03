const jwt = require('jsonwebtoken');

class Auth {
    constructor(level) {
        this.level = level || 1;

        Auth.USER = 8;
        Auth.ADMIN = 16;
        Auth.SPUSER_ADMIN = 32;
    }

    get m() {
        // token 检测
        return async (ctx, next) => {
            let token = ctx.get('Authorization'); // 使用 ctx.get() 获取 Authorization 头

            if (!token || !token.startsWith('Bearer ')) {
                throw new global.errs.Forbidden('需要携带有效的 Bearer Token');
            }

            token = token.split(' ')[1]; // 提取 Bearer 后面的 Token

            let errMsg = '无效的token';

            try {
                const decode = jwt.verify(token, process.env.SECRET_KEY);
                if (decode.scope < this.level) {
                    errMsg = '权限不足';
                    throw new global.errs.Forbidden(errMsg);
                }
                // 设置 ctx.auth，包含用户ID和权限
                ctx.auth = {
                    uid: decode.uid,
                    scope: decode.scope
                };
                errMsg = 'token外的其他异常';
                await next();
            } catch (error) {
                // token 不合法 过期
                if (error.name === 'TokenExpiredError') {
                    errMsg = 'token已过期';
                    throw new global.errs.Forbidden(errMsg);
                }
                if(error.name==='JsonWebTokenError'){
                    errMsg = 'token无效';
                    throw new global.errs.Forbidden(errMsg);
                }
                // throw new global.errs.Forbidden(errMsg);
                throw error
            }
        };
    }
}

module.exports = {
    Auth
};