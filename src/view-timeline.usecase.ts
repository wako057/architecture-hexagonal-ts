import { MessageRepository } from "./message.repository";
import { MessageTimeline } from "./messageTimeline";
import { DateProvider } from "./post-message.usecase";

const ONE_MINUTE_INE_MILLISECOND = 60000;
export class ViewTimelineUseCase {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly dateProvider: DateProvider 
    ) { };

    async handle({ user }: { user: string }): Promise<MessageTimeline[]> {
        const messageOfUser = await this.messageRepository.getAllOfUser(user);
        messageOfUser.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

        return messageOfUser.map(message => (
            {
            author: message.author,
            text: message.text,
            publicationTime: this.publicationTime(message.publishedAt),

        }));
    };

    private publicationTime = (publicationTime: Date) => {
        const now = this.dateProvider.getNow();
        const diff = now.getTime() - publicationTime.getTime();
        const minutes = Math.floor(diff / ONE_MINUTE_INE_MILLISECOND);
    
        if (minutes < 1) {
            return "less than a minute ago";
        }
    
        if (minutes < 2) {
            return "1 minute ago";
        }
    
        return `${minutes} minutes ago`;
    };
}

