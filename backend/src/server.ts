import "./models/index"; // Import asociacionet para se të përdoren
import { createApp } from "./app";
import { testConnection } from "./config/database";
import { env } from "./config/env";

const startServer = async () => {
  try {
    await testConnection();
    const app = createApp();
    app.listen(env.server.port, () => {
      console.log(`Serveri po dëgjon në portin ${env.server.port}`);
    });
  } catch (error) {
    console.error("Gabim në nisjen e serverit:", error);
    process.exit(1);
  }
};

startServer();

