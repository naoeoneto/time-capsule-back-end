import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { extname, resolve } from "path";
import { createWriteStream } from "fs";
import { promisify } from "util";
// transforma algumas funções que nao tinham suportes para promises em promises.
import { pipeline } from "stream";
// pipeline permite aguardar um processo de upload ser finalizado, sabendo quando ele acaba.
const pump = promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/upload", async (request, reply) => {
    const upload = await request.file({
      limits: {
        fieldSize: 5_242_880, // equivale a 5GB
      },
    });

    if (!upload) {
      return reply.status(400).send();
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);
    // mimetype é categorização global do tipo de arquivo.

    if (!isValidFileFormat) {
      return reply.status(400).send();
    }

    const fileId = randomUUID(); // gera um id aleatório
    const extension = extname(upload.filename); // retorna a extensão do arquivo original
    const fileName = fileId.concat(extension); // o nome nome do arquivo é o id concatenado com a extensão do arquivo.

    const writeStream = createWriteStream(
      resolve(__dirname, "../../uploads", fileName)
    );
    // createWriteStream faz com que o arquivo possa ser salvado aos poucos no disco. O resolve mostra o caminho onde o arquivo deve ser salvo, padronizando para todos os sistemas operacionais.

    await pump(upload.file, writeStream);

    const fullUrl = request.protocol.concat("://").concat(request.hostname);
    // request.protocol acessa a url do servidor, deixando a aplicação dinâmica. hostname é o domínio da aplicação sem deixar dados expostos
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString();
    // Cria uma nova url usando a url base (fullUrl) pra adicionar a informação gerada na sequência (primeiro parâmetro da função URL). É uma outra forma de fazer concatenação, ou seja, poderia ser substituído por '.concat'.

    return { fileUrl };
  });
}
