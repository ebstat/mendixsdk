// src/index.js
const express = require('express');
const { MendixPlatformClient } = require('mendixplatformsdk');

const app  = express();
const PORT = process.env.PORT || 3000;

// --- auth ---
const PAT = process.env.MENDIX_PAT;
if (!PAT) {
  console.error('Missing MENDIX_PAT');
  process.exit(1);
}

const client = new MendixPlatformClient();

client.platform().setApiKey(PAT);

/* ---------- route ---------- */
app.get('/microflows/:appId', async (req, res) => {
  try {
    const { appId } = req.params;

    const mxApp = await client.platform().getApp(appId);
    const workingCopy = await mxApp.createTemporaryWorkingCopy('main');
    const model = await workingCopy.openModel();

    const names = [];
    for (const mf of model.allMicroflows()) {
      names.push(mf.qualifiedName);
    }
    res.json({ microflows: names });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

app.get('/', (_req, res) => res.send('Mendix Model Reader is running'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
