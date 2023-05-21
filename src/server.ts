import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { memoriesRoutes } from "./routes/memories";
import { authRoutes } from "./routes/auth";

const app = fastify();

app.register(cors, { origin: true });
// Dentro de origin deverão entrar todos os endereços de url permitidos, como por exemplo o localhost e o endereço do servidor. Eles substituem o true e são colocados dentro de um array.

app.register(jwt, { secret: "iudyabdlubhuashbalsuiwuh" });
// O secret é uma maneira de diferenciar os jwts gerados nesse back end dos gerados em outros back ends. É importante que não seja uma string simples e fácil de ser encontrada em outras aplicações. Em ambientes de desenvolvimento pode ser usado um termo mais simples.

app.register(authRoutes);
app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
    host: "0.0.0.0", // Deve ser colocado pro mobile funcionar
  })
  .then(() => {
    console.log("Servidor rodando em http://localhost:3333");
  });
