#!/usr/bin/env node

import {v4 as uuidv4 } from 'uuid';
import { Command } from "commander";
import { DateProvider, PostMessageCommand, PostMessageUseCase } from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/message.inmemory.repository";
import { FileSystemMessageRepository } from "./src/message.fs.repository";
import { ViewTimelineUseCase } from './src/view-timeline.usecase';


class RealDateProvider implements DateProvider {
    getNow(): Date {
        return new Date();
    }
}
const dateProvider = new RealDateProvider();
const messageRepository = new FileSystemMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
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
        new Command("view")
        .argument("<user>", "The user to view the timeline of")
        .action(async(user) => {
            try {
                const timeline = await viewTimelineUseCase.handle({user});
                console.table(timeline);
                process.exit(0);
            } catch(err) {
                console.error("❌", err);
                process.exit(1);
            }
        })
    ); 

async function main() {
    await program.parseAsync();
}

main();