const { sendMessage } = require('../handles/sendMessage'); // Adjust the path as needed

module.exports = {
  name: 'id',
  description: 'Show sender ID',
  author: 'System',
  role: 1,
  async execute(senderId, args, pageAccessToken) {
    // Construct the response message
    const response = `senderId: ${senderId}`;
    
    // Send the message
    try {
      await sendMessage(senderId, { text: response }, pageAccessToken);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
};