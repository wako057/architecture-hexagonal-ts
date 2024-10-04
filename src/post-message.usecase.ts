
export type Message = {
    id: string,
    text: string,
    author: string,
    publishedAt: Date
};

export type PostMessageCommand = {
    id: string,
    text: string,
    author: string
}

export interface MessageRepository {
    save(message: Message): Promise<void>;
}

export interface DateProvider{
    getNow(): Date
}

export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export class PostMessageUseCase {
    constructor(
        private readonly saveMessage: MessageRepository,
        private readonly dateProvider: DateProvider
    ) {}

    async handle(postMessageCommand: PostMessageCommand) {

        if (postMessageCommand.text.trim().length === 0) {
            throw new EmptyMessageError();
        }

        if (postMessageCommand.text.length > 280) {
            throw new MessageTooLongError();
        }

        await this.saveMessage.save({
            id: postMessageCommand.id,
            text: postMessageCommand.text,
            author: postMessageCommand.author,
            publishedAt: this.dateProvider.getNow()
        });
    }
}