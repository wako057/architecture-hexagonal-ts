import * as path from "path";
import * as fs from "fs";
import { MessageRepository } from "./message.repository";
import { Message } from "./message";

export class FileSystemMessageRepository implements MessageRepository {
    message: Message;

    save(message: Message): Promise<void> {
        this.message = message;
        
        return fs.promises.writeFile(
            path.join(__dirname, "message.json"),
            JSON.stringify(message) 
        );
    }
    
    getAllOfUser(user: string): Promise<Message[]> {
        throw new Error("Method not implemented.");
    }

}