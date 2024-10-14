import { Message } from "../../domain/message";
import { FollowerRepository } from "../follower.repository";
import { MessageRepository } from "../message.repository";

export class WallUseCase {

    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly followerRepository: FollowerRepository
    ) {}
    handle({user, followee} : {user: string, followee: string}): Promise<Message[]> {
        const userFollowee = this.followerRepository.getUser(user);
        // const messages = this.messageRepository.
        return Promise.resolve([]);
    }
}