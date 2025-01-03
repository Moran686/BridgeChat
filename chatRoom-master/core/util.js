const jwt = require('jsonwebtoken')

/**
 * 合并为一个对象
 * @param {} base 
 * @param {*} newData 
 * @returns 
 */
const  customMerge = function(base, newData) {
    const result = { ...base }; // 先复制 base 对象
    for (const key in newData) {
      if (key === 'id') continue; // 跳过 id 属性
      result[key] = newData[key];
    }
    return result;
  }
const findMembers = function (instance, { prefix, specifiedType, filter }) {
    // 递归函数
    function _find(instance) {
        //基线条件（跳出递归）
        if (instance.__proto__ === null) return []

        let names = Reflect.ownKeys(instance)
        names = names.filter(name => {
            // 过滤掉不满足条件的属性或方法名
            return _shouldKeep(name)
        })

        return [...names, ..._find(instance.__proto__)]
    }

    function _shouldKeep(value) {
        if (filter) {
            if (filter(value)) {
                return true
            }
        }
        if (prefix) if (value.startsWith(prefix)) return true
        if (specifiedType) if (instance[value] instanceof specifiedType) return true
    }

    return _find(instance)
}

// 颁布令牌
const generateToken = function (uid, scope) {
    // generateToken(admin.id, Auth.ADMIN) 管理员
    // generateToken(user.id, Auth.USER) 用户
    const token = jwt.sign(
        {
            uid,
            scope
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.EXPIRES_IN
        }
    )
    return token
}
/* 判断是否为对象
 *
 * @param obj
 * @returns {boolean}
 */
const isObject = obj => {
    const isObject = Object.prototype.toString.call(obj) === '[object Object]'
    if (isObject) {
        return Object.keys(obj).length > 0
    }

    return isObject
}

/**
 * 判断是否为数组
 * @param arr
 * @returns {boolean}
 */
const isArray = arr => {
    const isArray = Object.prototype.toString.call(arr) === '[object Array]'
    if (isArray) {
        return arr.length > 0
    }

    return isArray
}

module.exports = {
    findMembers,
    generateToken,
    isArray,
    isObject,
    customMerge
}
