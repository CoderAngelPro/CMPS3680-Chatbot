import dotenv from 'dotenv';
import express from 'express';
import { CohereClientV2 } from 'cohere-ai';
import mongoose from 'mongoose';
import './models/user.js';
import './models/message.js';
import { User } from './models/user.js';
import { Message } from './models/message.js';
import jwt from 'jsonwebtoken';
import path from 'path';

dotenv.config();

const app  = express();
const port = 3000;
const cohere = new CohereClientV2({ token: process.env.API_KEY });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
})();

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.register(email, password);
    res.status(201).json({ id: user._id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user   = await User.login(email, password);
    const token  = jwt.sign({ uid: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) throw new Error();
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Auth required' });
  }
};


const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  try {
    if (token) req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch { /* bad token → treat as guest */ }
  next();
};

app.get('/server', (_req, res) =>
  res.type('text/plain').send('HELLO WORLD')
);

app.use(express.static('www', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
  }
}));


app.get('/generate', optionalAuth, async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const chat = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [{ role: 'user', content: prompt }]
    });

    const reply = (
      chat.text ??                                   
      chat.message?.content?.[0]?.text ??            
      chat.choices?.[0]?.message?.content ??         
      chat.generations?.[0]?.text ??                 
      ''
    );

    if (req.user && reply) {
      await Message.create({ userId: req.user.uid, prompt, reply });
    }

    res.json({ text: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.get('/history', auth, async (req, res) => {
  try {
    const docs = await Message
      .find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(docs.reverse());  
  } catch (e) {
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.delete('/history', auth, async (req, res) => {
  await Message.deleteMany({ userId: req.user.uid });
  res.sendStatus(204);           
});


app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);