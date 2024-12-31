const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "spotify",
  description: "Search for a Spotify track using a keyword",
  role: 1,
  author: "developer",

  async execute(senderId, args, pageAccessToken) {
    if (typeof senderId !== 'string') {
      console.error(`Invalid senderId provided:`, senderId);
      return sendMessage(senderId, {
        text: `Error: Invalid sender ID provided.`
      }, pageAccessToken);
    }

    const searchQuery = args.join(" ");

    if (!searchQuery) {
      return sendMessage(senderId, {
        text: `Usage: spotify [music title]`
      }, pageAccessToken);
    }

    try {
      const res = await axios.get('https://hiroshi-api.onrender.com/tiktok/spotify', {
        params: { search: searchQuery }
      });

      if (!res || !res.data || res.data.length === 0) {
        throw new Error("No results found");
      }

      const { name: trackName, download, image, track } = res.data[0];

      // Send the track name and link message
      await sendMessage(senderId, {
        text: `🎶 Now playing: ${trackName}\n\n🔗 Spotify Link: ${track}`
      }, pageAccessToken);

      // Send the track image
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: image
          }
        }
      }, pageAccessToken);

      // Send the audio attachment
      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: {
            url: download
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error retrieving the Spotify track:", error);
      await sendMessage(senderId, {
        text: `Error retrieving the Spotify track. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};
