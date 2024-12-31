const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'blackbox',
  description: 'Ask a question to the Blackbox AI',
  role: 1,
  author: 'Kiana',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    // Default message if no prompt is provided
    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Hello! I am Blackbox Ai, how can I help you?'
      }, pageAccessToken);
    }

    const apiUrl = `https://rest-apiv2-ni-clarence.onrender.com/api/blackbox?message=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.response;

      if (reply) {
        // Format the response
        const formattedResponse = `💻📦 𝗕𝗹𝗮𝗰𝗸𝗯𝗼𝘅 𝗔𝗜 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:\n\n${reply}`;
        
        // Facebook Messenger's character limit
        const maxLength = 2000;

        // Check if the message is too long and split if necessary
        if (formattedResponse.length > maxLength) {
          const chunks = [];
          let remainingText = formattedResponse;

          while (remainingText.length > 0) {
            chunks.push(remainingText.substring(0, maxLength));
            remainingText = remainingText.substring(maxLength);
          }

          // Send each chunk as a separate message
          for (const chunk of chunks) {
            await sendMessage(senderId, { text: chunk }, pageAccessToken);
          }
        } else {
          // Send the response directly if it's within the limit
          await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
        }
      } else {
        // Fallback message if there's no reply
        await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Blackbox API:', error);

      // Send an error message to the user
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};