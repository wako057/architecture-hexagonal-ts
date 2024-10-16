#!/usr/bin/env node

import { v4 as uuidv4 } from 'uuid';
import * as httpErrors from "http-errors";
import { RealDateProvider } from '../infra/real-date.provider';
import { PostMessageCommand, PostMessageUseCase } from '../application/usecase/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecase/view-timeline.usecase';
import { EditMessageCommand, EditMessageUseCase } from '../application/usecase/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '../application/usecase/follow-user.usecase';
import { ViewWallUseCase } from '../application/usecase/view-wall.usecase';
import { PrismaClient } from '@prisma/client';
import { PrismaMessageRepository } from '../infra/message.prisma.repository';
import { PrimaFolloweeRepository } from '../infra/followee.prisma.repository';
import Fastify, { FastifyInstance, FastifyReply,  } from 'fastify';
import { TimelinePresenter } from '../application/timeline-presenter';
import { Timeline } from '../domain/timeline';

const prismaClient = new PrismaClient();
const dateProvider = new RealDateProvider();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrimaFolloweeRepository(prismaClient);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository);

class ApiTimelinePresenter implements TimelinePresenter {
    constructor(private readonly reply: FastifyReply) {}

    show(timeline: Timeline): void {
        this.reply.status(200).send(timeline.data);
    }

}

const fastify = Fastify({ logger: true });

type IQuerystringUser = {
    user: string;
  };

const routes = async (fastifyInstance: FastifyInstance) => {
    fastifyInstance.post<{ Body: { user: string, message: string } }>("/post", {}, async (request, reply) => {
        const postMessageCommand: PostMessageCommand = {
            id: uuidv4(),
            author: request.body.user,
            text: request.body.message
        }

        try {
            const result = await postMessageUseCase.handle(postMessageCommand);

            if  (result.isOk()) {
                return reply.status(201);
            }
            reply.send(httpErrors[403](result.error));

        } catch (err) {
            reply.send(httpErrors[500](err));
        }
    });

    fastifyInstance.post<{ Body: { messageId: string, message: string } }>("/edit", {}, async (request, reply) => {
        const editMessageCommand: EditMessageCommand = {
            messageId: request.body.messageId,
            text: request.body.message
        }

        try {
            const result = await editMessageUseCase.handle(editMessageCommand);
            if (result.isOk()) {
                reply.status(200);
                return;
            }
            reply.send(httpErrors[403](result.error))
        } catch (err) {
            reply.send(httpErrors[500](err));
        }
    });

    fastifyInstance.post<{ Body: { user: string, followee: string } }>("/follow", {}, async (request, reply) => {
        const followUserCommand: FollowUserCommand = {
            user: request.body.user,
            userToFollow: request.body.followee
        };

        try {
            await followUserUseCase.handle(followUserCommand);
            reply.status(201);
        } catch (err) {
            reply.send(httpErrors[500](err));
        }
    });

    fastifyInstance.get<{
        Querystring: IQuerystringUser,
        Reply:
        | { author: string; text: string; publicationTime: string }[]
        | httpErrors.httpError<500>;
    }>("/view", {}, async (request, reply) => {

        const timelinePresenter = new ApiTimelinePresenter(reply);
        try {
            await viewTimelineUseCase.handle(
                { user: request.query.user },
                timelinePresenter 
            );
        } catch (err) { 
            reply.send(httpErrors[500](err));
        }
    })

    fastifyInstance.get<{
        Querystring: IQuerystringUser,
        Reply:
        | { author: string; text: string; publicationTime: string }[]
        | httpErrors.httpError<500>;
    }>("/wall", {}, async (request, reply) => {

        const timelinePresenter = new ApiTimelinePresenter(reply);
        try {
            await viewWallUseCase.handle(
                {user:request.query.user},
                timelinePresenter
            );
        } catch (err) {
            reply.send(httpErrors[500](err));
        }
    })

};

fastify.register(routes);

// fastify.addHook("onClose", async () => {
//     await prismaClient.$disconnect();
// })

async function main() {
    try {
        await prismaClient.$connect();
        await fastify.listen({port: 3000});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

main();