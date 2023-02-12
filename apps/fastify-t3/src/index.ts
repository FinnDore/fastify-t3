import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify, { FastifyInstance } from 'fastify';
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

import { appRouter } from './router/root';
import { createTRPCContext } from './trpc';

const docsUrl = '/documentation';
// eslint-disable-next-line turbo/no-undeclared-env-vars
const port = +(process.env.PORT ?? 3001);

const server: FastifyInstance = Fastify({
    maxParamLength: 5000,
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

const packageJSON = {
    name: '@acme/server',
    description: 'aaa',
    version: '0.0.0',
    main: 'dist/apps/server/src/index.js',
};

void server.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: { router: appRouter, createContext: createTRPCContext },
});

void server.register(fastifySwagger, {
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
void server.register(fastifySwaggerUI, {
    routePrefix: '/documentation',
});

const s = server.withTypeProvider<ZodTypeProvider>();

void s.after(() => {
    void s.get(
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
        (req, res) => {
            console.log(req.query.name);
            void res.send({
                pong: 'yes',
            });
        }
    );
});

server.after(() =>
    console.log(
        `Server started on port ${port} 🚀\nSwagger: http://localhost:${port}${docsUrl} 🤓 `
    )
);

try {
    await server.listen({ port });
} catch (err) {
    console.log(err);
    server.log.error(`Failed to start the server ${err}`);
    process.exit(22);
}
