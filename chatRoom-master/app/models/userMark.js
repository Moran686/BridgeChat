const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('@core/db');
const { User } = require('./user');

const UserMark  = sequelize.define("UserMark",{
    remark_name:{
        type:DataTypes.STRING,
        allowNull:true,
        comment:"备注名字",
        

    },
    phone:{
        type:DataTypes.STRING,
        allowNull:true,
    }
},{
    tableName:"user_remarks",
    timestamps:true,
    paranoid:true,
})

User.hasMany(UserMark,{
    foreignKey:"user_id",
    as:"remarks"
})

UserMark.belongsTo(User,{
    foreignKey:'user_id',
    as:'user'
})
User.hasMany(UserMark,{
    foreignKey:"target_user_id",
    as:"targetRemarks"
})

UserMark.belongsTo(User,{
    foreignKey:"target_user_id",
    as:"targetUser"
})


// 导出 UserProfile 模型
module.exports = {
    UserMark
};