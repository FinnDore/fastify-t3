import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import Fastify, { FastifyInstance } from 'fastify';
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import packageJSON from '../package.json' assert { type: 'json' };

const docsUrl = '/documentation';
const port = +(process.env.PORT ?? 3001);

const server: FastifyInstance = Fastify();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: packageJSON.name,
            description: packageJSON.description,
            version: packageJSON.version,
        },
        servers: [],
    },
    transform: jsonSchemaTransform,
});
server.register(fastifySwaggerUI, {
    routePrefix: '/documentation',
});

const s = server.withTypeProvider<ZodTypeProvider>();

s.after(async () => {
    s.get(
        '/ping',
        {
            schema: {
                querystring: z.object({
                    name: z.string().min(4).describe('Name of the user'),
                }),
                response: {
                    200: z.object({ pong: z.string() }),
                },
            },
        },
        async (req, res) => {
            console.log(req.query.name);
            res.send({
                pong: 'yes',
            });
        }
    );
});

server.after(() =>
    console.log(
        `Server started on port ${port} 🚀\nSwagger: http://localhost:${port}${docsUrl}} 🤓 `
    )
);

try {
    await server.listen({ port });
} catch (err) {
    server.log.error(`Failed to start the server ${err}`);
    process.exit(1);
}
