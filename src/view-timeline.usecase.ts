import { MessageRepository } from "./message.repository";
import { MessageTimeline } from "./messageTimeline";


export class ViewTimelineUseCase {
    constructor(private readonly messageRepository: MessageRepository) { };

    async handle({ user }: { user: string }): Promise<MessageTimeline[]> {
        const messageOfUser = await this.messageRepository.getAllOfUser(user);
        messageOfUser.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

        return [
            {
                author: messageOfUser[0].author,
                text: messageOfUser[0].text,
                publicationTime: "4 min ago",
            },
            {
                author: messageOfUser[1].author,
                text: messageOfUser[1].text,
                publicationTime: "6 min ago",
            },
        ];
    }
}