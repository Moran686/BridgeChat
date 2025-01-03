const { Rule, ParamsValidator } = require('@core/params-validator')


class AvatarValidator extends ParamsValidator {
    constructor() {
        super()
        this.avatar = [
            new Rule('matches', '上传的必须是图片地址', '^https?:')

        ]
 
    }

 
  
}
module.exports = {
    AvatarValidator
}
