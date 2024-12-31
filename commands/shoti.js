const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "shoti",
  description: "Send a random shoto video",
  author: "Heru",

  async execute(senderId, args, pageAccessToken) {
    try {
      const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
      const { shotiurl: videoUrl, username, nickname, duration } = response.data;

      await sendMessage(senderId, {
        text: `🌸 Username: ${username}\n💟 Nickname: ${nickname}\n⏳ Duration: ${duration} seconds`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error("Failed to fetch the Chilli video:", error);
      sendMessage(senderId, {
        text: `Failed to fetch the Chilli video. Error: ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};