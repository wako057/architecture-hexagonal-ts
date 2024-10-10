import { Message } from "./message";
import { MessageRepository } from "./message.repository"

export type EditMessageCommand = {
    messageId: string,
    text: string
}

export class EditMessageUseCase {
    constructor(private readonly messageRepository: MessageRepository) { }

    async handle(editMessageCommand: EditMessageCommand) {

        const message = await this.messageRepository.getById(editMessageCommand.messageId);

        message.editText(editMessageCommand.text);
        
        await this.messageRepository.save(message);
    }
}