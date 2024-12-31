const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: 'lyrics',
  description: 'Fetch song lyrics',
  author: 'Deku (rest api)',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');
    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/lyrics?song=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Extract the data from the API response
      const { title, artist, lyrics, image } = response.data;

      if (lyrics) {
        const lyricsMessage = `Title: ${title}\nArtist: ${artist}\n\n${lyrics}`;

        // Send the lyrics message in chunks
        await sendResponseInChunks(senderId, lyricsMessage, pageAccessToken);

        // Optionally send an image if available
        if (image) {
          await sendMessage(
            senderId,
            {
              attachment: {
                type: 'image',
                payload: {
                  url: image,
                  is_reusable: true,
                },
              },
            },
            pageAccessToken
          );
        }
      } else {
        console.error('Error: No lyrics found in the response.');
        await sendMessage(senderId, { text: 'Sorry, no lyrics were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Lyrics API:', error.message);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  },
};

// Function to send messages in chunks
async function sendResponseInChunks(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

// Function to split a message into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let chunk = '';
  const words = message.split(' ');

  for (const word of words) {
    if ((chunk + word).length > chunkSize) {
      chunks.push(chunk.trim());
      chunk = '';
    }
    chunk += `${word} `;
  }

  if (chunk) {
    chunks.push(chunk.trim());
  }

  return chunks;
}