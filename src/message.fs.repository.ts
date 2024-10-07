import * as path from "path";
import * as fs from "fs";
import { MessageRepository } from "./message.repository";
import { Message } from "./message";

export class FileSystemMessageRepository implements MessageRepository {
    private readonly messagePath = path.join(__dirname, "message.json");
    message: Message;

    async save(message: Message): Promise<void> {
        const messages = await this.getMessages();
        messages.push(message);
        console.log(messages, message);
        this.message = message;
        
        
        return fs.promises.writeFile(
            this.messagePath,
            JSON.stringify(messages) 
        );
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
            text: m.text,
            author: m.author,
            publishedAt: new Date(m.publishedAt)
        }));
    }

    async getAllOfUser(user: string): Promise<Message[]> {
        const messages = await this.getMessages();
        return messages.filter(message => message.author === user);
    }
}