// src/index.js
const express = require('express');
const { MendixSdkClient } = require('mendixplatformsdk');

const app  = express();
const PORT = process.env.PORT || 3000;

const USERNAME = process.env.MENDIX_USERNAME;
const APIKEY   = process.env.MENDIX_APIKEY;

if (!USERNAME || !APIKEY) {
  console.error('Missing MENDIX_USERNAME and/or MENDIX_APIKEY');
  process.exit(1);
}

const client = new MendixSdkClient(USERNAME, APIKEY);

app.get('/microflows/:appId', async (req, res) => {
  try {
    const { appId } = req.params;

    const project = await client.platform().getProject(appId);
    if (!project) {
      return res.status(404).json({ error: 'App not found or access denied' });
    }

    const workingCopy = await project.createTemporaryWorkingCopy('main');
    const model = await client.model().openWorkingCopy(workingCopy.id);

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
