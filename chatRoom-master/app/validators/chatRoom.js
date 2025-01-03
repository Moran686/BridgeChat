const { Rule, ParamsValidator } = require('@core/params-validator')

const { ChatRoomUser,ChatRoom } = require('@models/chatRoom')

class CreateRoomValidator extends ParamsValidator {
    constructor() {
        super()
        // this.avatar = [
        //     new Rule('matches', '上传的必须是图片地址', '^https?:')

        // ]
        this.name = [
            new Rule('isLength', '聊天室长度必须在2~16之间', {
                min: 2,
                max: 16
            })
        ]
    }
    
 
  
}
module.exports = {
    CreateRoomValidator
}
