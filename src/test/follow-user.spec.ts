import { FollowerUseCase } from "../application/usecase/follower.usecase";
import { InMemoryFollowerRepository } from "../infra/follower.inmemory.repository";

describe("Feature: Following a user", () => {
    let fixture: Fixture;

    beforeEach(() => {
        fixture = createFixture();
    });

    test("Alice can follow Bob", async () => {

        fixture.givenUseFollowees({
            user: "Alice",
            followees: ["Charlie"],
        });

        await fixture.whenUserFollows({
            user: "Alice",
            userToFollow: "Bob"
        });

        await fixture.thenUserFolloweesAre({
            user: "Alice",
            followees: ["Charlie", "Bob"]
        })
    })
})


const createFixture = () => {
    const followersRepository = new InMemoryFollowerRepository();
    const followerUseCase = new FollowerUseCase(followersRepository);

    return {
        givenUseFollowees({ user, followees }: { user: string, followees: string[] }) {
            followersRepository.givenExistingFollowees(user, followees);

         },
        async whenUserFollows(followCommand: { user: string, userToFollow: string }) {
            await followerUseCase.handle(followCommand)
         },
        async thenUserFolloweesAre({ user, followees }: { user: string, followees: string[] }) { 
            const following = await followersRepository.getUser(user);

            console.log('voici la liste', following);
            console.table( following.map(m => ({[user]: m})));

            expect(following.length).toEqual(followees.length)
            expect(following).toEqual(
                expect.arrayContaining(followees)
            );
        }
    }
}

type Fixture = ReturnType<typeof createFixture>