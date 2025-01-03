const { sequelize } = require('@core/db');
const { ChatRoomUser ,ChatRoom} = require("../models/chatRoom");
const { where } = require('sequelize');
const {User} = require("@models/user")
const scope= 'bh'
class ChatRoomDao {
    
    static async create(param) {
        let transaction; // 将 transaction 声明移动到 try 块外部

        try {
            // 开启事务
            transaction = await sequelize.transaction();

                        // 检查是否已存在同名的聊天室
            const existingChatRoom = await ChatRoom.findOne({
                where: { name: param.name,creatorId:param.creatorId,deleted_at: null },
                transaction
            });

            if (existingChatRoom) {
                // throw new ValidationError('Chat room with this name already exists');
                return ["房间已存在，请勿重复创建",null]
            }

            // 创建 chatRoom
            const chatRoom = await ChatRoom.create(param, { transaction });

            // 创建 ChatRoomUser 并将创建者设置为管理员
            await ChatRoomUser.create({
                chatRoomId: chatRoom.id,
                userId: chatRoom.creatorId,
                role: "admin"
            }, { transaction });

            // 提交事务
            await transaction.commit();

            return [null, chatRoom];
            
        } catch (err) {
            // 如果事务存在，则回滚
            if (transaction) {
                await transaction.rollback();
            }

            // 返回错误
            return [err, null];
        }
    }

  /**
   * 获取所有聊天室列表
   * @param {Object} options - 查询选项，如分页、排序等
   * @returns {Promise<Array>} - 聊天室列表
   */
    static async listPublic(options = {}){
        const scope= 'bh'
        try{
            const res  = await ChatRoom.scope(scope).findAll({
                  ...options,  
                  //获取关联的User的一些属性值
            })
            return [null,res]
        }catch(err){
            return [err,null]
        }
    }

  /**
   * 根据 ID 获取单个聊天室
   * @param {number} roomId - 聊天室的 ID
   * @returns {Promise<Object|null>} - 聊天室对象，如果找不到则返回 null
   */
    static async getRoomById(roomId){
        const scope= 'bh'
        try{
            const res =  await ChatRoom.scope(scope).findByPk(roomId)

            return [null,res];
        }catch(err){
            return [err,null]
        }
    }
  /**
   * 更新聊天室信息
   * @param {number} roomId - 聊天室的 ID
   * @param {Object} updateData - 需要更新的字段和值
   * @returns {Promise<number>} - 更新的行数
   */
    static async updateChatRoom(roomId,v){

        const room = await ChatRoom.scope(scope).findOne({
            where:{id:roomId}
          });
    
          if (!room) {
            // throw new global.errs.NotFound('查找聊天室出错')
            return ["查找聊天室出错", null];
          }

        // 准备更新数据对象
        const updateData = {};
        const fields = ['bio', 'avatar', 'name', 'type','bg_image'];
        for (const field of fields) {
          const value = v.get(`body.${field}`);
          if (value !== undefined) { // 检查值是否存在
            updateData[field] = value;
          }
        }
      
        // 应用更新
        Object.assign(room, updateData);
      
        try {
          // 保存更新
          const res = await room.save();
          return [null, res];
        } catch (err) {
          // 处理保存错误
          return [err, null];
        }
    }

    
  /**
   * 获取某个用户创建的所有聊天室
   * @param {number} userId - 用户的 ID
   * @returns {Promise<Array>} - 聊天室列表
   */
   static async getChatRoomsCreatedByUser(userId){
    try {
        const res =  await ChatRoom.scope(scope).findAll({
          where: { creatorId: userId },
        });
        return [null,res];
      } catch (error) {
        // throw new Error(`获取用户创建的聊天室失败: ${error.message}`);
        return ["获取用户创建的聊天室失败",null];
      }
   }

     /**
   * 获取某个聊天室的所有成员
   * @param {number} roomId - 聊天室的 ID
   * @returns {Promise<Array>} - 成员列表
   */
   static async getChatRoomsMembers(roomId){
    try {
        const res =  await ChatRoomUser.scope(scope).findAll({
          where: { chatRoomId: roomId },
        });
        return [null,res]
      } catch (error) {
        // throw new Error(`获取聊天室成员失败: ${error.message}`);
        return ["获取聊天室成员失败",null]
      }
   }

   /**
    * 申请加入新聊天室
    * @param {*} userId 
    * @param {*} roomId 
    * @returns 
    */
   static async joinRoom(userId,roomId){
      try{
        //检查是否已经加入
        const existing = await ChatRoomUser.findOne({
          where:{userId,chatRoomId:roomId}
        })
        if(existing){
          return ["您已经是该聊天室的成员了",null]
        }

        //check if thr room exist
        const chatRoom =  await ChatRoom.findByPk(roomId);
        if(!chatRoom){
          return ["聊天室不存在",null];
        }


        if(chatRoom.type==='private'){
          return ["私聊房间不允许新成员加入",null]
        }

        const membership = await ChatRoomUser.create({
          userId,
          chatRoomId:roomId,
          role:"member"
        })
        return [null,membership]
      }catch(err){
        //已经加入
        return [err,null]
      }
   }
 
  /**
   * 获取用户加入的所有群聊
   * @param {number} userId - 用户的 ID
   * @returns {Promise<Array>} - 包含用户加入的所有群聊对象的数组
   */
  static async getUserChatRooms(userId) {
    const scope = 'bh'
    try {
      const chatRooms = await ChatRoom.scope(scope).findAll({
        where: {
          deleted_at: null // 只获取群聊类型
        },
        include: [
          {
            model: User,
            as: 'users', // 使用 'users' 作为别名，因为这是 belongsToMany 关系中的别名
            through: { attributes: [] }, // 忽略中间表的属性
            where: {
              id: userId
            },
            attributes: []
          },
          // {
          //   model: User,
          //   as: 'creator', // 获取聊天室的创建者信息
          //   attributes: ['id', 'username'] // 你可以选择需要的字段
          // }
        ]
      });

      return [null,chatRooms];
    } catch (error) {
      return ['获取玩家加入房间出错:',null]
    }
  }

   static async deleteRoom(roomId){

    try{
      //开启事务
      const transaction = await sequelize.transaction()

      try{
        //search the room
        const chatRoom = await ChatRoom.findByPk(roomId,{transaction})

        if(!chatRoom){
          return ["聊天室不存在",null]
        }

        //delete the chatRoomUser 
        await ChatRoomUser.destroy({
          where:{chatRoomId:roomId},
          transaction
        })

        //delete the chatRoom
        await ChatRoom.destroy({transaction})

        //submit the transition
        const res = await transaction.commit()

        return [null,res]
      }catch(error){
        //rollback
        await transaction.rollback()
        return [error,null];
      }
    }catch(err){
      return [err,null]
    }
   }

   static async isRoomAdmin(roomId, userId) {
    try {
        // 查找用户在该聊天室中的角色
        const membership = await ChatRoomUser.findOne({
            where: {
                chatRoomId: roomId,
                userId,
                role: 'admin'
            }
        });

        if (!membership) {
            return ["您不是管理员哦！", null];
        }

        return [null, membership];
    } catch (error) {
        return [error, null];
    }
}
    static async leaveChatRoom(roomId, userId){
        try {
            // 找到用户在聊天室中的角色
            const chatRoomUser = await ChatRoomUser.findOne({
                where: {
                    userId: userId,
                    chatRoomId: roomId,
                },
            });

            if (!chatRoomUser) {
                return ["用户不在这个房间" ,null]
            }

            // 如果用户是管理员，删除聊天室
            if (chatRoomUser.role === 'admin') {
                // 查找该聊天室的所有管理员，如果该聊天室只有一个管理员，则删除聊天室
                const adminCount = await ChatRoomUser.count({
                    where: {
                        chatRoomId: roomId,
                        role: 'admin',
                    },
                });

                if (adminCount === 1) {
                    // 删除聊天室
                    await ChatRoom.destroy({
                        where: {
                            id: roomId,
                        },
                    });
                    return [null,"删除房间成功"]
                } else {
                    // 只是移除用户
                    await chatRoomUser.destroy();
                    return [null,"退出房间成功"]

                }
            } else {
                // 如果是普通成员，直接移除用户
                await chatRoomUser.destroy();
                return [null,"退出房间成功"]

            }
        } catch (error) {
            return ["用户退出房间出错",null]
        }
    }

}

module.exports = {
    ChatRoomDao
}