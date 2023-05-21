import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    await request.jwtVerify();
    // Funciona como um middleware para confirmar se o token passado no ato da requisição é válido.
  });
  // Essa função faz com que toda requisição dentro de memoriesRoutes faça a verificação de usando jwt sem que seja necessário declará-la em cada rota.

  app.get("/memories", async (request) => {
    const memories = await prisma.memory.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: "asc" },
    });

    const returnedMemories = memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        resume: memory.content.substring(0, 100).concat("..."),
      };
    });

    return returnedMemories;
  });

  app.get("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string(),
    });
    // Zod faz a validação como o yup

    const { id } = paramsSchema.parse(request.params);
    // Utilizando o método parse, o paramsSchema vai confirmar se o id que vem no request.params é do tipo esperado ou se dispara um erro.

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id: id },
    });

    if (!memory.isPublic && memory.userId != request.user.sub) {
      return reply.status(401).send();
    }

    return memory;
  });

  app.post("/memories", async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });
    // Coerce converte o valor que chegar no campo onde for declarado para boolean. Por exemplo, uma string vazia é equivalente a 'false', assim como uma string é considerado 'true'.

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    });

    return memory;
  });

  app.put("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    let memory = await prisma.memory.findUniqueOrThrow({ where: { id } });

    if (memory.userId != request.user.sub) {
      return reply.status(401).send();
    }

    await prisma.memory.update({
      where: { id: id },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    });
  });

  app.delete("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    let memory = await prisma.memory.findUniqueOrThrow({ where: { id } });

    if (memory.userId != request.user.sub) {
      return reply.status(401).send();
    }

    await prisma.memory.delete({ where: { id: id } });
  });
}
