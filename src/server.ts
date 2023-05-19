import fastify from "fastify";
import cors from "@fastify/cors";
import { memoriesRoutes } from "./routes/memories";

const app = fastify();

app.register(cors, { origin: true });
// Dentro de origin deverão entrar todos os endereços de url permitidos, como por exemplo o localhost e o endereço do servidor. Eles substituem o true e são colocados dentro de um array.

app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Servidor rodando em http://localhost:3333");
  });
