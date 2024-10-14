import { MessageRepository } from "../application/message.repository";
import { FollowerUseCase } from "../application/usecase/follower.usecase";
import { WallUseCase } from "../application/usecase/wall.usecase";
import { Message } from "../domain/message";
import { InMemoryFollowerRepository } from "../infra/follower.inmemory.repository";
import { InMemoryMessageRepository } from "../infra/message.inmemory.repository";

export const createFollowingFixture = () => {
    const followersRepository = new InMemoryFollowerRepository();
    const messageRepository = new InMemoryMessageRepository();
    const followerUseCase = new FollowerUseCase(followersRepository);
    const wallUseCase = new WallUseCase(messageRepository, followersRepository);

    return {
        async thenUsersWallShouldBe({ user, messages }: {
            user: string,
            messages: { author: string, message: string }[]
        }) {
            const wall = await wallUseCase.handle({user});
            const toBeChecked = wall.map(msg => ({ author: msg.author, message: msg.text}));
            expect(toBeChecked).toEqual(messages);
        },
        givenTheFollowingMessagesExist(messages: Message[]) {
            messageRepository.givenExistingMessages(messages);
        },
        givenUseFollowees({ user, followees }: { user: string, followees: string[] }) {
            followersRepository.givenExistingFollowees(user, followees);

        },
        async whenUserFollows(followCommand: { user: string, userToFollow: string }) {
            await followerUseCase.handle(followCommand)
        },
        async thenUserFolloweesAre({ user, followees }: { user: string, followees: string[] }) {
            const following = await followersRepository.getUser(user);

            expect(following.length).toEqual(followees.length)
            expect(following).toEqual(
                expect.arrayContaining(followees)
            );
        }
    }
};

export type FollowingFixture = ReturnType<typeof createFollowingFixture>