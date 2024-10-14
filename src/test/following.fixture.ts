import { MessageRepository } from "../application/message.repository";
import { FollowerUseCase } from "../application/usecase/follower.usecase";
import { InMemoryFollowerRepository } from "../infra/follower.inmemory.repository";

export const createFollowingFixture = () => {
    const followersRepository = new InMemoryFollowerRepository();
    const followerUseCase = new FollowerUseCase(followersRepository);

    return {
        async thenUsersWallShouldBe({ user, followee, messages, messagingRepository }: {
            user: string,
            followee: string,
            messages: { author: string, message: string }[],
            messagingRepository: MessageRepository
        }) {
            const follow = await followersRepository.getUser(user);
            const messagesChk = await Promise.all(follow.flatMap((f) => messagingRepository.getAllOfUser(f)));
            const messageChkFlatOrdered = messagesChk
                .flat()
                .sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime())
                .map(msg => ({ author: msg.author, message: msg.text}));

            expect(messageChkFlatOrdered).toEqual(
                messages
            );
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