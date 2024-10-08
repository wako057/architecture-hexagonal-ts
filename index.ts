#!/usr/bin/env node

import { v4 as uuidv4 } from 'uuid';
import { Command } from "commander";
import { RealDateProvider } from './src/infra/real-date.provider';
import { FileSystemMessageRepository } from './src/infra/message.fs.repository';
import { PostMessageCommand, PostMessageUseCase } from './src/application/usecase/post-message.usecase';
import { ViewTimelineUseCase } from './src/application/usecase/view-timeline.usecase';
import { EditMessageCommand, EditMessageUseCase } from './src/application/usecase/edit-message.usecase';



const dateProvider = new RealDateProvider();
const messageRepository = new FileSystemMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const program = new Command();

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
                    await postMessageUseCase.handle(postMessageCommand);
                    console.log("✅ Message posté");
                    console.table(await messageRepository.getMessages());
                    process.exit(0);
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
                    messageId : messageId,
                    text: message
                }

                try {
                    await editMessageUseCase.handle(editMessageCommand);
                    console.log("✅ Message edité");
                    console.table(await messageRepository.getMessages());
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
                    const timeline = await viewTimelineUseCase.handle({ user });
                    console.table(timeline);
                    process.exit(0);
                } catch (err) {
                    console.error("❌", err);
                    process.exit(1);
                }
            })
    );

async function main() {
    await program.parseAsync();
}

main();