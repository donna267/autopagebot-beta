const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage"); // Correctly import sendMessage

module.exports = {
  name: "uid",
  description: "Find Facebook ID using a profile link",
  role: 1,
  author: "Clarence",

  async execute(senderId, args, pageAccessToken) {
    const profileUrl = args.join(" ");

    if (!profileUrl) {
      await sendMessage(senderId, {
        text: `Usage: findid [Facebook profile URL]`
      }, pageAccessToken);
      return;
    }

    try {
      // Make a request to the API with the profile URL
      const res = await axios.get(`https://api.joshweb.click/api/findid`, {
        params: { url: profileUrl }
      });

      // Extract the Facebook ID from the response
      const { status, result } = res.data;

      if (status && result) {
        // Send the result back to the user
        await sendMessage(senderId, {
          text: `🔍 Facebook ID: ${result}`
        }, pageAccessToken);
      } else {
        throw new Error("Unable to retrieve Facebook ID");
      }
    } catch (error) {
      console.error("Error retrieving Facebook ID:", error);
      await sendMessage(senderId, {
        text: `Error retrieving Facebook ID. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};