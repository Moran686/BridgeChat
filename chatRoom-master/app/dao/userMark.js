const { Op, where } = require('sequelize')
const { UserMark } = require('@models/userMark')

 
class UserMarkDao {
    // 获取当前用户对选中用户的备注
    static async getRemark(userId, targetUserId) {
      const scope = 'bh'
      let mark = await UserMark.scope(scope).findOne({
          where: {
            user_id: userId,
            target_user_id: targetUserId
          }
        });
      if(!mark){
        mark = await UserMark.create({
          user_id: userId,
          target_user_id: targetUserId,
          remark_name: "",
          phone: ""
        });
        
      }
      return [null,mark];
    }
  
    // 更新当前用户对选中用户的备注
    static async updateRemark(userId, targetUserId, v) {

      const remark = await UserMark.findOne({
        where:{
          user_id:userId,
          target_user_id:targetUserId
        }
      });

      if (!remark) {
        // throw new global.errs.NotFound('备注出错，没有这个备注')
        return ["备注出错，没有这个备注",null]
      }

      remark.remark_name = v.get('body.remarkName')
      remark.phone = v.get('body.phone')
  
 

      try {
          const res = await remark.save()
          return [null, res]
      } catch (err) {
          return [err, null]
      }
  }

}
module.exports = {
    UserMarkDao
}
