const { Op, where } = require('sequelize')
const { UserProfile } = require('@models/profile')


class UserProfileDao {
    
    static async create(params){
        try{
            const profile = await UserProfile.create(params);
            return [null,profile];
        }catch (error) {
            // console.error('创建用户个人资料时出错:', error);
            return ["创建用户个人资料时出错", null];
        }
        
    }
    static async findByUserId(userId){
        try{
            const scope = 'bh'
            const profile = await UserProfile.scope(scope).findOne({
                where:{user_id:userId}
            })
            return [null,profile];
        }catch(error){
            return [error,null];
        }
    }
    static async updateByUserId(userId, v) {
        // 查找用户资料
        const profile = await UserProfile.findOne({
          where: {
            user_id: userId,
          },
        });
      
        // 如果用户资料不存在，抛出错误
        if (!profile) {
          // throw new Error('用户详情信息出错');
          return ["用户详情信息出错",null]
        }
      
        // 准备更新数据对象
        const updateData = {};
        const fields = ['bio', 'avatar', 'gender', 'birthday'];
        for (const field of fields) {
          const value = v.get(`body.${field}`);
          if (value !== undefined) { // 检查值是否存在
            updateData[field] = value;
          }
        }
      
        // 应用更新
        Object.assign(profile, updateData);
      
        try {
          // 保存更新
          const res = await profile.save();
          return [null, res];
        } catch (err) {
          // 处理保存错误
          return [err, null];
        }
      }
}
    
module.exports = {
    UserProfileDao
}
