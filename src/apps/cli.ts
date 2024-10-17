#!/usr/bin/env node

import { v4 as uuidv4 } from 'uuid';
import { Command } from "commander";
import { RealDateProvider } from '../infra/real-date.provider';
import { PostMessageCommand, PostMessageUseCase } from '../application/usecase/post-message.usecase';
import { ViewTimelineUseCase } from '../application/usecase/view-timeline.usecase';
import { EditMessageCommand, EditMessageUseCase } from '../application/usecase/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '../application/usecase/follow-user.usecase';
import { ViewWallUseCase } from '../application/usecase/view-wall.usecase';
import { PrismaClient } from '@prisma/client';
import { PrismaMessageRepository } from '../infra/message.prisma.repository';
import { PrimaFolloweeRepository } from '../infra/followee.prisma.repository';
import { DefaultTimelinePresenter } from './timeline.default.presenter';
import { TimelinePresenter } from '../application/timeline-presenter';
import { Timeline } from '../domain/timeline';

class CliTimelinePresenter implements TimelinePresenter {
    constructor(private readonly defaultTimelinePresenter: DefaultTimelinePresenter) { }

    show(timeline: Timeline): void {
        console.table(this.defaultTimelinePresenter.show(timeline));
    }
}
const prismaClient = new PrismaClient();
const dateProvider = new RealDateProvider();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrimaFolloweeRepository(prismaClient);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUserCase = new FollowUserUseCase(followeeRepository);
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository);
const program = new Command();
const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const timelinePresenter = new CliTimelinePresenter(defaultTimelinePresenter);

program
    .version("1.0.0")
    .description("crafty social network")
    .addCommand(
        new Command("post")
            .argument("<user>", "The Current User")
            .argument("<message>", "The Message To Post")
            .action(async (user, message) => {
                const postMessageCommand: PostMessageCommand = {
                    id: uuidv4(),
                    author: user,
                    text: message
                }

                try {
                    const result = await postMessageUseCase.handle(postMessageCommand);
                    if (result.isOk()) {
                        console.log("✅ Message posté");
                        process.exit(0);
                    }
                    console.error("❌", result.error);
                    process.exit(1);
                } catch (err) {
                    console.error("❌", err);
                    process.exit(1);
                }
            })
    )
    .addCommand(
        new Command("edit")
            .argument("<message-id>", "The Message Id Of The Message To Edit")
            .argument("<message>", "The New Text")
            .action(async (messageId, message) => {
                const editMessageCommand: EditMessageCommand = {
                    messageId: messageId,
                    text: message
                }

                try {
                    const result = await editMessageUseCase.handle(editMessageCommand);
                    if (result.isOk()) {
                        console.log("✅ Message edité");
                        process.exit(0);
                    }
                    console.error("❌", result.error);
                    process.exit(1);
                } catch (err) {
                    console.error("❌", err);
                    process.exit(1);
                }
            })
    )
    .addCommand(
        new Command("follow")
            .argument("<user>", "The current user")
            .argument("<user-to-follow>", "The user to follow")
            .action(async (user, userToFollow) => {
                const followUserCommand: FollowUserCommand = {
                    user,
                    userToFollow
                };

                try {
                    await followUserUserCase.handle(followUserCommand);
                    console.log(`✅ Tu suis maintenant ${userToFollow}`);
                    process.exit(0);
                } catch (err) {
                    console.error("❌", err);
                    process.exit(1);
                }
            })
    )
    .addCommand(
        new Command("view")
            .argument("<user>", "The user to view the timeline of")
            .action(async (user) => {
                try {
                    const timeline = await viewTimelineUseCase.handle({ user }, timelinePresenter);
                    console.table(timeline);
                    process.exit(0);
                } catch (err) {
                    console.error("❌", err);
                    process.exit(1);
                }
            })
    )
    .addCommand(
        new Command("wall")
            .argument("<user>", "The user to view the wall of")
            .action(async (user) => {
                try {
                    const timeline = await viewWallUseCase.handle({ user }, timelinePresenter);
                    console.table(timeline);
                    process.exit(0);
                } catch (err) {
                    console.error("❌", err);
                    process.exit(1);
                }
            })
    );

async function main() {
    await prismaClient.$connect();
    await program.parseAsync();
    await prismaClient.$disconnect();
}

main();