import { Message } from "../../domain/message";
import { FollowerRepository } from "../follower.repository";
import { MessageRepository } from "../message.repository";

export type WallCommand = {
    user: string
};

export class WallUseCase {

    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly followerRepository: FollowerRepository
    ) { }
    async handle(user: string): Promise<Message[]> {
        const userFollowee = await this.followerRepository.getUser(user);

        const messages = await Promise.all(userFollowee.map(f => this.messageRepository.getAllOfUser(f)));

        const messagesChkFlatOrdered = messages
            .flat()
            .sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime());

        return Promise.resolve(messagesChkFlatOrdered);
    }
}