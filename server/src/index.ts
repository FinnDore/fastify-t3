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
import { description, name, version } from '../package.json';

const server: FastifyInstance = Fastify({});
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: name,
            description,
            version,
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

    try {
        server.after(() =>
            console.log(`Server started on port ${process.env.PORT ?? 3000}`)
        );
        await server.listen({ port: +(process.env.PORT ?? 3000) });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
});
