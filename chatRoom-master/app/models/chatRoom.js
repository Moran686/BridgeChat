const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('@core/db');
const { User } = require('./user');

const ChatRoom  = sequelize.define("ChatRoom",{
    id:{
        type:DataTypes.INTEGER(10).UNSIGNED,
        primaryKey:true,
        autoIncrement:true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        comment:"聊天室名字",

    },
    type: {
        type: DataTypes.ENUM('private', 'group'), // 使用 ENUM 类型，更直观
        allowNull: true,
        defaultValue: 'group', // 默认单聊
        comment: "聊天室类型,private 表示私,group 表示",
      },
    avatar:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:"http://120.46.94.52:5200/f5d1011cf22c547b43ef1abca1524d76.png",
        comment: "聊天室头像 URL",
    },
    creatorId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: User, // 引用 User 模型
          key: 'id',   // 引用 User 模型的 id 字段
        },
        comment: "创建该聊天室的用户 ID",
    },
    bio:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:"这里什么介绍都没有"
    },
    bgImage:{
      type:DataTypes.STRING,
      allowNull:true
    }



},{
    tableName:"chat_room",
    timestamps:true,
    modelName: 'chat_room"',
    paranoid:true,//启用软删除
    // 在模型选项中设置初始自增值
    initialAutoIncrement: 10000,
    indexes:[
        {fields:['name']},
        {fields:["type"]}  // // 为 type 字段添加索引 ,提高搜索性能
    ]
})



const ChatRoomUser = sequelize.define('ChatRoomUser', {
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "用户加入聊天室的时间",
    },
    role: {
      type: DataTypes.ENUM("admin","member"),
      allowNull: true,
      defaultValue:"member",
      comment: "用户在聊天室中的角色（例如：管理员、成员）",
    },
  }, {
    tableName: 'chat_room_users',
    timestamps: true,
    paranoid:true,//启用软删除
  });

 

// 定义多对多关系
ChatRoom.belongsToMany(User, { through: ChatRoomUser, foreignKey: 'chatRoomId', as: 'users' });
User.belongsToMany(ChatRoom, { through: ChatRoomUser, foreignKey: 'userId', as: 'chatRooms' });
// 定义 belongsTo 关系，表示每个聊天室有一个创建者
ChatRoom.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });


// ChatRoom.sync({ alter: true }).then(() => {
//   console.log('ChatRoom model synced');
// });
 

module.exports = {
    ChatRoom,
    ChatRoomUser
};