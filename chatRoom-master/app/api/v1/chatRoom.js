const Router = require('koa-router')
const { ChatRoomDao } = require('@dao/chatRoom')
const { RegisterValidator, PositiveIdParamsValidator, UserLoginValidator } = require('@validators/user')
const {CreateRoomValidator} = require('@validators/chatRoom')
const {AvatarValidator} = require('@validators/avatar')
const { Resolve } = require('@lib/helper')
const { Auth } = require('@middlewares/auth')
const { ChatRoom } = require('@models/chatRoom')
const AUTH_USER = 8
const AUTH_ADMIN = 16
const res = new Resolve()
const router = new Router({
    prefix: '/api/v1/chatRoom'
})



router.post('/createRoom',new Auth(AUTH_USER).m, async ctx => {
    // const { name, type, avatar,bio ,bgImage} = ctx.request.body;
    const { name, type = 'group', avatar="http://120.46.94.52:5200/f5d1011cf22c547b43ef1abca1524d76.png", 
        bio = '这里什么介绍都没有', bgImage="" } = ctx.request.body;
    const v = await new CreateRoomValidator().validate(ctx)
    const creatorId = ctx.auth.uid;

    const [err,data] = await ChatRoomDao.create(
        {name,
        type,
        avatar, // 如果没有提供 avatar，则设置为 null
        creatorId, 
        bio,
        bgImage
    }
    )
    if(!err){
        ctx.response.status = 200
        ctx.body = res.json(data)
    }else {
        ctx.body = res.fail(err)
    }
     // 返回创建成功的聊天室信息
})
router.get('/roomListPublic',   async ctx => {
    //  
    let [err, data] = await ChatRoomDao.listPublic()
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})
router.get('/getRoomById',   async ctx => {
    // 

    const v = await new PositiveIdParamsValidator().validate(ctx)
    const roomId = v.get('query.id')

    let [err, data] = await ChatRoomDao.getRoomById(roomId)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})
router.put('/updateChatRoom/:id', new Auth(AUTH_USER).m,   async ctx => {
  

    const v = await new PositiveIdParamsValidator().validate(ctx)
    v = await new AvatarValidator().validate(ctx)
    
    const roomId = v.get('path.id')
 
    
    let [err, data] = await ChatRoomDao.updateChatRoom(roomId,v)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})
router.get('/getChatRoomsCreatedByUser', new Auth(AUTH_USER).m, async ctx => {
    

    const userId = ctx.auth.uid;

    let [err, data] = await ChatRoomDao.getChatRoomsCreatedByUser(userId)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})
router.get('/getChatRoomsMembers',   async ctx => {
    //  

    const v = await new PositiveIdParamsValidator().validate(ctx)

    const roomId = v.get("query.id");
    let [err, data] = await ChatRoomDao.getChatRoomsMembers(roomId)
    if (!err) {
        ctx.response.status = 200
        ctx.body = res.json(data)
    } else {
        ctx.body = res.fail(err)
    }
})
 
//加入聊天室
router.post('/joinRoom', new Auth(AUTH_USER).m  ,async ctx => {
    // 查询所有用户信息

    const v = await new PositiveIdParamsValidator().validate(ctx)
    const roomId = v.get("body.id");

    try{
        let [err, data] = await ChatRoomDao.joinRoom(ctx.auth.uid,roomId)

        if (!err) {
            ctx.response.status = 200
            ctx.body = res.json(data)
        } else {
            ctx.body = res.fail(err)
        }
    }catch(error){
        ctx.body = res.fail(error)
    }

})
//删除聊天室
router.delete("/deleteRoom/:id",new Auth(AUTH_USER).m,async ctx=>{
    const v = await new PositiveIdParamsValidator().validate(ctx);
    const roomId= v.get("path.id")
    const userId = ctx.auth.uid;
    try{

        const [erro,datao] = await ChatRoomDao.isRoomAdmin(roomId,userId);
        if(erro){
            ctx.body = res.fail(erro) 
        }else{
            const [err,data] = await ChatRoomDao.deleteRoom(roomId);
            if(!err){
                ctx.response.status = 200
                ctx.body = res.json(data)
            }else {
                ctx.body = res.fail(err)
            }
        }



    }catch (error) {
        ctx.body = res.fail("系统错误"); 
    }
})

//获取玩家加入的所有房间
router.get("/getUserChatRooms",new Auth(AUTH_USER).m,async ctx=>{
    const userId = ctx.auth.uid;
    try{
        const [erro,datao] = await ChatRoomDao.getUserChatRooms(userId);
        if(erro){
            ctx.body = res.fail(erro) 
        }else{
            ctx.response.status = 200
            ctx.body = res.json(datao)
        }
    }catch (error) {
        ctx.body = res.fail("系统错误"); 
    }
})


// 退出聊天室
router.post("/leaveChatRoom",new Auth(AUTH_USER).m,async ctx=>{
    const userId = ctx.auth.uid;

    const roomId = ctx.request.body.id;
    const [err,data] = await ChatRoomDao.leaveChatRoom(roomId,userId);
    if(!err){
        ctx.response.status = 200;
        ctx.body = res.json(data)
    }else{
        ctx.body = res.fail(err);
    }
})

module.exports = router
