import express from 'express';
import path from 'path';
import { generateLinearStringB64, getTreeCost } from './main.js';

const app = express();
const port = 3000;

// Definindo o caminho da pasta "src"
const srcDir = path.resolve('src');
const publicDirectory = path.resolve('src/public');

// Servir todos os arquivos em public
app.use(express.static(publicDirectory))
app.use(express.json())

// Servindo o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(srcDir, 'index.html'));
});

app.post('/linear-string-to-img', async (req, res) => {
    try {
        const b64 = await generateLinearStringB64(req.body.linearString)
        const cost = getTreeCost(req.body.linearString)
        res.status(200).json({img: b64, cost})
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }
});

app.listen(port, () => {
  console.log(`🌐 Server is running at http://localhost:${port}`);
});