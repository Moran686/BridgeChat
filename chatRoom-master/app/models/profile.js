const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('@core/db');

// 定义用户个人资料模型
class UserProfile extends Model {}

// 初始化用户个人资料模型
UserProfile.init(
    {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '用户个人资料主键ID'
        },
        user_id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            references: {
                model: 'user', // 引用 User 模型
                key: 'id'      // 引用 User 的 id 字段
            },
            comment: '用户ID'
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '用户头像URL',
            defaultValue:"http://120.46.94.52:5200/f5d1011cf22c547b43ef1abca1524d76.png"  //女生头像
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: true,
            defaultValue: 'other',
            comment: '用户性别'
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: '用户生日'
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '用户简介',
            defaultValue:"这个人很懒，什么都没留下..."
        }
    },
    {
        sequelize,
        modelName: 'userProfile',
        tableName: 'user_profile'
    }
);

// 导出 UserProfile 模型
module.exports = {
    UserProfile
};