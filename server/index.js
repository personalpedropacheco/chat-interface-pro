import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3002;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ollama: OLLAMA_URL });
});

// List available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  const { message, model = 'llama2', conversationHistory = [], temperature = 0.7 } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Build context from conversation history
  let prompt = '';
  conversationHistory.forEach(msg => {
    prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
  });
  prompt += `User: ${message}\nAssistant:`;

  try {
    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: model,
        prompt: prompt,
        stream: true,
        options: {
          temperature: temperature,
          num_predict: 1000,
        },
      },
      { responseType: 'stream' }
    );

    let fullResponse = '';

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim());

      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            fullResponse += parsed.response;
            res.write(`data: ${JSON.stringify({ token: parsed.response, done: false })}\n\n`);
          }

          if (parsed.done) {
            res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
            res.end();
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      });
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Ollama API Error:', error.message);
    res.status(500).json({ error: 'Failed to get response from Ollama' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
});
