import * as path from "path";
import * as fs from "fs";
import { Message, MessageRepository } from "./post-message.usecase";

export class FileSystemMessageRepository implements MessageRepository {
    message: Message;

    save(message: Message): Promise<void> {
        this.message = message;
        
        return fs.promises.writeFile(
            path.join(__dirname, "message.json"),
            JSON.stringify(message) 
        );
    }

}