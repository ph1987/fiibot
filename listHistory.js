import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const historyDir = path.join(process.cwd(), 'history');
  fs.readdir(historyDir, (err, files) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao ler os arquivos da pasta history' });
    } else {
      res.status(200).json(files);
    }
  });
}