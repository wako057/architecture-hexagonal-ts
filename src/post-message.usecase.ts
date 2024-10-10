import { EmptyMessageError, MessageText, MessageTooLongError } from "./message";
import { MessageRepository } from "./message.repository";


export type PostMessageCommand = {
    id: string,
    text: string,
    author: string
}


export interface DateProvider{
    getNow(): Date
}

export class PostMessageUseCase {
    constructor(
        private readonly saveMessage: MessageRepository,
        private readonly dateProvider: DateProvider
    ) {}

    async handle(postMessageCommand: PostMessageCommand) {
        
        const messageText = MessageText.of(postMessageCommand.text);

        await this.saveMessage.save({
            id: postMessageCommand.id,
            text: messageText,
            author: postMessageCommand.author,
            publishedAt: this.dateProvider.getNow()
        });
    }
}