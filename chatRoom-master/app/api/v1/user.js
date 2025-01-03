/**
 * @description 用户的路由 API 接口
 * @author 
 */

const Router = require('koa-router')

const { RegisterValidator, PositiveIdParamsValidator, UserLoginValidator } = require('@validators/user')

const { UserDao } = require('@dao/user')
const { Auth } = require('@middlewares/auth')
const { LoginManager } = require('@service/login')
const { Resolve } = require('@lib/helper')
const { UserProfileDao } = require('../../dao/profile')
const { UserMarkDao } = require('../../dao/userMark')
const {customMerge}  = require('@core/util')
const res = new Resolve()

const AUTH_USER = 8
const AUTH_ADMIN = 16

const router = new Router({
    prefix: '/api/v1/user'
})

// 用户注册
router.post('/register', async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new RegisterValidator().validate(ctx)
    const email = v.get('body.email')
    const password = v.get('body.password2')

    // 创建用户
    const [err, data] = await UserDao.create({
        password,
        email,
        username: v.get('body.username'),

    })

    if (!err) {
        const [errToken, token, id] = await LoginManager.userLogin({
            email,
            password
        })
        if (!errToken) {
            data.token = token
            data.id = id
        }


        const [errProfile, profile] = await UserProfileDao.create({
            user_id:id,
            
        })

        if(!errProfile){
            data.profile = profile
            ctx.response.status = 200
            ctx.body = res.json(data)
        }
        // 返回结果

    } else {
        ctx.body = res.fail(err)
    }
})

// 登录
router.post('/login', async ctx => {
    const v = await new UserLoginValidator().validate(ctx)

    let [err, token, id] = await LoginManager.userLogin({
        email: v.get('body.email'),
        password: v.get('body.password')
    })

    if (!err) {
        try {
            // let data  = {}
            // 登录成功，调用 /profile 接口获取用户资料
            let [profileErr, profileData] = await UserProfileDao.findByUserId(id);
            if (profileErr) {
                // 如果获取用户资料失败，返回错误信息
                ctx.response.status = 500;
                ctx.body = res.fail(profileErr, '查询个人资料时出错');
                return;
            } else if (!profileData) {

        
                // 如果用户资料不存在，返回错误信息
                ctx.response.status = 404;
                ctx.body = res.fail(null, '个人资料不存在');
                return;
            }else{
                    // 查询用户信息
                    let [err, dataBase] = await UserDao.detail(id, 1)
                    // 如果用户资料获取成功，将资料添加到返回的数据中
                    profileData.setDataValue('token', token);
                    // const data = {dataBase,profileData}
                    let data = {}
                    data  =   {...dataBase.dataValues,...profileData.dataValues}


                    
                    ctx.response.status = 200;


                    ctx.body = res.json(data);
            }

        } catch (error) {
            // 捕获任何异常并返回错误信息
            ctx.response.status = 500;
            ctx.body = res.fail(error, '登录时获取个人资料出现异常');
        }


        // let [err, data] = await UserDao.detail(id)
        // if (!err) {
        //     data.setDataValue('token', token)
        //     ctx.response.status = 200
        //     ctx.body = res.json(data)
        // }
    } else {
        ctx.body = res.fail(err, err.msg)
    }
})


//获取用户的全部详情信息
router.get('/getDetailAll', async ctx => {
    // const v = await new PositiveIdParamsValidator().validate(ctx)
    const userId = ctx.query.id
    try {
            // 登录成功，调用 /profile 接口获取用户资料
            let [profileErr, profileData] = await UserProfileDao.findByUserId(userId);
            if (profileErr) {
                // 如果获取用户资料失败，返回错误信息
                ctx.response.status = 500;
                ctx.body = res.fail(profileErr, '查询个人资料时出错');
                return;
            } else if (!profileData) {
                // 如果用户资料不存在，返回错误信息
                ctx.response.status = 404;
                ctx.body = res.fail(null, '个人资料不存在');
                return;
            }else{
                    // 查询用户信息
                    let [err, dataBase] = await UserDao.detail(userId, 1)
                    // 如果用户资料获取成功，将资料添加到返回的数据中
                    let data = {}
                    data  =   {...dataBase.dataValues,...profileData.dataValues}
                    ctx.response.status = 200;
                    ctx.body = res.json(data);
            }
        } catch (error) {
            // 捕获任何异常并返回错误信息
            ctx.response.status = 500;
            ctx.body = res.fail(error, '获取用户详情出现异常');
        }
})

// 退出聊天室
router.post("/leaveChatRoom",new Auth(AUTH_USER).m,async ctx=>{
    const userId = ctx.auth.uid;
    const roomId = ctx.query.roomId;
    const [err,data] = await UserChatRoomDao.leaveChatRoom(userId,roomId);
    if(!err){
        ctx.response.status = 200;
        ctx.body = res.success("退出聊天室成功");
    }else{
        ctx.body = res.fail(err);
    }
})



// 获取用户信息
router.get('/auth', new Auth(AUTH_USER).m, async ctx => {
    // 获取用户ID
    const id = ctx.auth.uid

    // 查询用户信息
    let [err, data] = await UserDao.detail(id, 1)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.response.status = 401
        ctx.body = res.fail(err, err.msg)
    }
})

router.get('/profile',async ctx=>{
    const userId = ctx.query.id
    let [err,profile] = await UserProfileDao.findByUserId(userId);
    if (err) {
        ctx.response.status = 500;
        ctx.body = res.fail(err, '查询个人资料时出错');
        return;
    }

    if (!profile) {
        ctx.response.status = 404;
        ctx.body = res.fail(null, '个人资料不存在');
        return;
    }

    ctx.response.status = 200;
    ctx.body = res.json(profile);
})
router.get('/getUserMark',new Auth(AUTH_USER).m,async ctx=>{
    const userId = ctx.auth.uid;
    const v = await new PositiveIdParamsValidator().validate(ctx)
    const targetId = ctx.query.id
    let [err,mark] = await UserMarkDao.getRemark(userId,targetId);
    if (err) {
        ctx.response.status = 500;
        ctx.body = res.fail(err, '查询备注信息时出错');
        return;
    }

    if (!mark) {
        ctx.response.status = 404;
        ctx.body = res.fail(null, '备注信息不存在');
        return;
    }

    ctx.response.status = 200;
    ctx.body = res.json(mark);
})
// 获取用户列表
// 需要管理员及以上才能操作
router.get('/list', new Auth(AUTH_ADMIN).m, async ctx => {
    // 查询用户信息
    let [err, data] = await UserDao.list(ctx.query)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})

// 获取用户信息
// 需要管理员及以上才能操作
router.get('/detail/:id', new Auth(AUTH_ADMIN).m, async ctx => {
    // 获取用户ID
    const v = await new PositiveIdParamsValidator().validate(ctx)
    const id = v.get('path.id')
    // 查询用户信息
    let [err, data] = await UserDao.detail(id)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})

// 获取用户列表
// 需要管理员及以上才能操作
router.delete('/delete/:id', new Auth(AUTH_ADMIN).m, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx)

    // 获取用户ID参数
    const id = v.get('path.id')
    // 删除用户
    const [err, data] = await UserDao.destroy(id)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.success('删除用户成功')
    } else {
        ctx.body = res.fail(err)
    }
})

// 获取更新用户信息
 
router.put('/update/:id', new Auth(AUTH_USER).m, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx)

    // 获取用户ID参数
    //const id = v.get('path.id')
    const id = ctx.auth.uid;
 
    const [err, data] = await UserDao.update(id, v)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.success('更新用户基本成功')
    } else {
        ctx.body = res.fail(err)
    }
})
/**
 * 更新用户基本信息
 */
router.put('/updateProfile/:id', new Auth(AUTH_USER).m, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx)

    // 获取用户ID参数
    const id = ctx.auth.uid;
 
    const [err, data] = await UserProfileDao.updateByUserId(id, v)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.success('更新用户详细信息成功')
    } else {
        ctx.body = res.fail(err)
    }
})
router.put('/updateRemark/:id', new Auth(AUTH_USER).m, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx)

    // 获取用户ID参数
    const targetId = v.get('path.id')
    const userId = ctx.auth.uid;
    // 删除用户
    const [err, data] = await UserMarkDao.updateRemark(userId, targetId,v)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.success('更新备注成功')
    } else {
        ctx.body = res.fail(err)
    }
})
module.exports = router
