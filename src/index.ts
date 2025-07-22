// src/index.ts
import express from 'express';
import { MendixPlatformClient } from 'mendixplatformsdk';

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

const PAT = process.env.MENDIX_PAT;
if (!PAT) {
  console.error('Missing MENDIX_PAT');
  process.exit(1);
}

const client = new MendixPlatformClient();

app.get('/microflows/:appId', async (req, res) => {
  try {
    const { appId } = req.params;

    const mxApp = await client.platform().getApp(appId, {
      personalAccessToken: PAT,
    });

    const workingCopy = await mxApp.createTemporaryWorkingCopy('main');
    const model = await workingCopy.openModel();

    const names = model.allMicroflows().map(mf => mf.qualifiedName);
    res.json({ microflows: names });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

app.get('/', (_req, res) => res.send('Mendix Model Reader is running'));

app.listen(PORT, () => console.log(`Server on ${PORT}`));
