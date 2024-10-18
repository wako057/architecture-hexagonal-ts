import { Message } from "../domain/message";
import { MessageRepository } from "../application/message.repository";

export class InMemoryMessageRepository implements MessageRepository {
    messages = new Map<string, Message>();

    save(message: Message): Promise<void> {
        this._save(message);

        return Promise.resolve();
    }

    getById(messageId: string): Promise<Message> {
        return Promise.resolve(this.getMessageById(messageId));
    }

    getMessageById(messageId: string) {
        return this.messages.get(messageId)!;
    }

    givenExistingMessages(messages: Message[]) {
        // messages.forEach(this._save.bind(this));
        messages.forEach((msg) => this._save(msg));
    }

    getAllOfUser(user: string): Promise<Message[]> {
        return Promise.resolve(
            [...this.messages.values()]
                .filter(msg => msg.author === user)
                .map(m => (Message.fromData({
                    id: m.id,
                    text: m.text,
                    author: m.author,
                    publishedAt: m.publishedAt
                })))
        );
    }

    private _save(msg: Message) {
        this.messages.set(msg.id, msg);
    }
}