import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`allctp backend running at http://0.0.0.0:${env.port}`);
});
