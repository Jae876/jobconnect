import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import your existing server setup
import { registerRoutes } from '../../server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up routes
async function setupApp() {
  await registerRoutes(app);
  return app;
}

let serverlessHandler;

export const handler = async (event, context) => {
  if (!serverlessHandler) {
    const app = await setupApp();
    serverlessHandler = serverlessExpress({ app });
  }
  
  return serverlessHandler(event, context);
};