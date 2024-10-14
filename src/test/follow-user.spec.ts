import { FollowUserCommand, FollowUserUseCase } from "../application/usecase/follow-user.usecase";
import { InMemoryFolloweeRepository } from "../infra/followee.inmemory.repository";
import { createFollowingFixture, FollowingFixture } from "./following.fixture";

describe("Feature: Following a user", () => {
    let fixture: FollowingFixture;

    beforeEach(() => {
        fixture = createFollowingFixture();
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
