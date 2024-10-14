import { DateProvider } from "../date-provider";
import { FolloweeRepository } from "../followee.repository";
import { MessageRepository } from "../message.repository";

const ONE_MINUTE_INE_MILLISECOND = 60000;

export class ViewWallUseCase {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly followeeRepository: FolloweeRepository,
        private readonly dateProvider: DateProvider
    ) { }

    async handle(user: string): Promise<{author: string, text: string, publicationTime: string}[]> {
        const followees = await this.followeeRepository.getFolloweesOf(user);
        const messages = (await Promise.all(
            [user, ...followees].map((user) => this.messageRepository.getAllOfUser(user))
        )).flat();

        messages.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

        return messages.map((msg) => ({
            author: msg.author,
            text: msg.text,
            publicationTime: this.publicationTime(msg.publishedAt)
        }));
     }

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