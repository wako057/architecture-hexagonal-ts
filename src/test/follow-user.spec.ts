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
    return {
        givenUseFollowees({ user, followees }: { user: string, followees: string[] }) { },
        whenUserFollows(followCommand: { user: string, userToFollow: string }) { },
        thenUserFolloweesAre({ user, followees }: { user: string, followees: string[] }) { }
    }
}

type Fixture = ReturnType<typeof createFixture>