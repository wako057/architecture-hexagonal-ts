#!/usr/bin/env node

import { Command } from "commander";
import { DateProvider, PostMessageCommand, PostMessageUseCase } from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/message.inmemory.repository";


class RealDateProvider implements DateProvider {
    getNow(): Date {
        return new Date();
    }
}
const dateProvider = new RealDateProvider();
const messageRepository = new InMemoryMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);

const program = new Command();

program
    .version("1.0.0")
    .description("crafty social network")
    .addCommand(
        new Command("post")
            .argument("<user>", "The Current User")
            .argument("<message>", "The Message To Post")
            .action((user, message) => {
                const postMessageCommand: PostMessageCommand = {
                    id: "some-message-id",
                    author: user,
                    text: message
                }

                try {
                    postMessageUseCase.handle(postMessageCommand);
                    console.log("✅ Message posté");
                    console.table([messageRepository.message]);
                } catch (err) {
                    console.error("❌", err);
                }
            })
    ); 

async function main() {
    await program.parseAsync();
}

main();