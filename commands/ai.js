const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Gpt4o x Gemini AI",
  role: 1,
  author: "Kiana",

async execute(bot, args, authToken, event) {
  // Validate event object and sender ID
  if (!event || !event.sender || !event.sender.id) {
    console.error('Invalid event object: Missing sender ID.');
    await sendMessage(bot, { text: 'Error: Missing sender ID.' }, authToken);
    return;
  }

  const senderId = event.sender.id; // Extract sender ID
  console.log(`AI command invoked by sender: ${senderId}`);

  const userPrompt = args.join(" "); // Combine arguments into a single prompt
  const repliedMessage = event.message?.reply_to?.message || ""; // Extract replied message content (if any)
  const finalPrompt = [repliedMessage, userPrompt].filter(Boolean).join(" ").trim(); // Combine reply + user input

  if (!finalPrompt) {
    console.warn(`No valid input from sender ${senderId}.`);
    await sendMessage(senderId, { text: "Please enter your question or reply with an image to analyze." }, authToken);
    return;
  }

  try {
    const imageUrl = await extractImageUrl(event, authToken);

    if (imageUrl) {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision`;
      const response = await handleImageRecognition(apiUrl, finalPrompt, imageUrl, senderId);
      const result = response.response;

      const visionResponse = `🌌 𝐆𝐞𝐦𝐢𝐧𝐢 𝐀𝐧𝐚𝐥𝐲𝐬𝐢𝐬\n━━━━━━━━━━━━━━━━━━\n${result}`;
      await sendLongMessage(senderId, visionResponse, authToken);
    } else {
      const apiUrl = `https://rest-api-french3.onrender.com/api/clarencev2`;
      const response = await axios.get(apiUrl, {
        params: {
          prompt: finalPrompt,
          uid: senderId
        }
      });
      const gptMessage = response.data.response;

      await sendLongMessage(senderId, gptMessage, authToken);
    }
  } catch (error) {
    console.error(`Error in AI command for sender ${senderId}:`, error.message || error);
    await sendMessage(senderId, { text: `Error: ${error.message || "Something went wrong."}` }, authToken);
  }
}
};

// Helper function to process image recognition via Gemini Vision API
async function handleImageRecognition(apiUrl, prompt, imageUrl, senderId) {
  try {
    const { data } = await axios.get(apiUrl, {
      params: {
        q: prompt,
        uid: senderId,
        imageUrl: imageUrl || ""
      }
    });
    return data;
  } catch (error) {
    console.error("Failed to connect to Gemini Vision API:", error.message);
    throw new Error("Failed to process the image with Gemini Vision.");
  }
}

// Helper function to extract image URL from event object
async function extractImageUrl(event, authToken) {
  try {
    if (event.message?.reply_to?.mid) {
      return await getRepliedImage(event.message.reply_to.mid, authToken);
    } else if (event.message?.attachments?.[0]?.type === 'image') {
      return event.message.attachments[0].payload.url;
    }
  } catch (error) {
    console.error("Failed to extract image URL:", error.message);
  }
  return ""; // Return an empty string if no image is found
}

// Helper function to get image URL from a replied message
async function getRepliedImage(mid, authToken) {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: authToken }
    });
    return data?.data[0]?.image_data?.url || "";
  } catch (error) {
    console.error("Failed to retrieve replied image:", error.message);
    throw new Error("Unable to retrieve the image from the replied message.");
  }
}

// Helper function to send long messages in chunks
function sendLongMessage(bot, text, authToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(bot, { text: messages[0] }, authToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(bot, { text: message }, authToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

// Helper function to split a message into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
