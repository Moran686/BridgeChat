const axios = require('axios');

// 定义 GoEasy 的 API URL 和配置
const goEasyOptions = {
  hostname: 'rest-hz.goeasy.io', // 新加坡的 REST 主机：rest-singapore.goeasy.io
  path: '/v2/pubsub/publish',
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

// 定义发布消息的函数
async function publishMessage(appkey, channel, content) {
  try {
    const response = await axios({
      url: `https://${goEasyOptions.hostname}${goEasyOptions.path}`,
      method: goEasyOptions.method,
      headers: goEasyOptions.headers,
      data: {
        appkey,
        channel,
        content,
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }), // 如果需要忽略 SSL 证书验证
    });

    console.log(`Status Code: ${response.status}`);
    console.log('Response Data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
    throw error; // 重新抛出错误以便调用者处理
  }
}

// 导出 publishMessage 函数
module.exports = {
  publishMessage,
};