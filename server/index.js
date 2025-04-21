import dotenv from 'dotenv';
import express from 'express';
import { CohereClientV2 } from 'cohere-ai';
dotenv.config();

const app = express();
const port = 3000;

const cohere = new CohereClientV2({ token: process.env.API_KEY});

app.use(express.static('www'));
app.set('trust proxy', true);

app.get('/server', (req, res) => {
  res.status(200)
    .type('text/plain')
    .send('HELLO WORLD');
});



app.get('/generate', async (req, res) => {
  try {
    const { prompt } = req.query;
      const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

    res.json({ text: response});
    

  } catch (error) {
    console.error('Cohere Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});


app.listen(port, () => {
  console.log('Server running on http://localhost:3000/generate');
});

