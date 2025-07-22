import express from 'express';
import { MendixPlatformClient } from 'mendixplatformsdk';
import { microflows } from 'mendixmodelsdk';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const PAT = process.env.MENDIX_PAT;
if (!PAT) {
  console.error('Missing MENDIX_PAT environment variable');
  process.exit(1);
}

const client = new MendixPlatformClient();         // <- 0 arguments
client.platform().setApiKey(PAT);                  // <- token here

app.get('/', (_req, res) => {
  res.json({ message: 'Mendix Model Reader is running' });
});

app.get('/microflows/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await client.getApp(appId);

    const workingCopy = await app.createTemporaryWorkingCopy('main');
    const model = await workingCopy.openModel();

    // Collect every microflow name in the entire model
    const result: string[] = [];
    for (const mf of model.allMicroflows()) {
      result.push(mf.qualifiedName);
    }

    res.json({ microflows: result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
