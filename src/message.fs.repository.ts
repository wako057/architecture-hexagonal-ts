import * as path from "path";
import * as fs from "fs";
import { MessageRepository } from "./message.repository";
import { Message, MessageText } from "./message";

export class FileSystemMessageRepository implements MessageRepository {
    constructor(
        private readonly messagePath = path.join(__dirname, "message.json")
    ) { }

    async save(message: Message): Promise<void> {
        const messages = await this.getMessages();

        const existingMessageIndex = messages.findIndex(msg => msg.id === message.id);

        if (existingMessageIndex === -1) {
            messages.push(message);
        } else {
            messages[existingMessageIndex] = message;
        }

        return fs.promises.writeFile(
            this.messagePath,
            JSON.stringify(
                messages.map(m => ({
                    id: m.id,
                    author: m.author,
                    publishedAt: m.publishedAt,
                    text: m.text.value
                }))
            )
        );
    }

    async getById(messageId: string): Promise<Message> {
        const allMessages = await this.getMessages();

        return allMessages.filter(msg => msg.id === messageId)[0];
    }

    public async getMessages(): Promise<Message[]> {
        const data = await fs.promises.readFile(this.messagePath);
        const message = JSON.parse(data.toString()) as {
            id: string,
            text: string,
            author: string,
            publishedAt: string
        }[];

        return message.map(m => ({
            id: m.id,
            text: MessageText.of(m.text),
            author: m.author,
            publishedAt: new Date(m.publishedAt)
        }));
    }

    async getAllOfUser(user: string): Promise<Message[]> {
        const messages = await this.getMessages();
        return messages.filter(message => message.author === user);
    }
}