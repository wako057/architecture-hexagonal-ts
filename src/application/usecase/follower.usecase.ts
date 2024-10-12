import { FollowerRepository } from "../follower.repository";

export type FollowCommand = {
    user: string,
    userToFollow: string
}

export class FollowerUseCase {

    constructor(private readonly followerRepository: FollowerRepository) { }

    async handle(follow: FollowCommand) {
console.log('FollowerUseCase');
        this.followerRepository.save(follow.user, follow.userToFollow);
        
    }

}