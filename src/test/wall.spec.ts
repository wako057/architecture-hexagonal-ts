import { createFollowingFixture, FollowingFixture } from "./following.fixture";
import { messageBuilder } from "./message.builder";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";

describe("Feature: Printing a wall", () => {
    let messagingFixture: MessagingFixture;
    let followingFixture: FollowingFixture;

    beforeEach(() => {
        messagingFixture = createMessagingFixture();
        followingFixture = createFollowingFixture();
    }) 

    test("Alice print Bobs' wall", () => {
        messagingFixture.givenTheFollowingMessagesExist([
            messageBuilder().authoredBy("Alice").withText("My first message").withDate(new Date("2024-10-07T10:04:00.000Z")).build(),
            messageBuilder().authoredBy("Bob").withText("Hi it's Bob").withDate(new Date("2024-10-07T10:05:00.000Z")).build(),
            messageBuilder().authoredBy("Alice").withText("My second message, how are you all?").withDate(new Date("2024-10-07T10:06:00.000Z")).build(),
            messageBuilder().authoredBy("Alice").withText("My last message").withDate(new Date("2024-10-07T10:09:30.000Z")).build(),
        ]);

        followingFixture.givenUseFollowees({
            user: "Bob",
            followees: ["Alice"],
        });

        followingFixture.thenUsersWallShouldBe({
            user: 'Bob', 
            followee: 'Alice',
            messages: [
                { author: 'Alice', message: "My last message" },
                { author: 'Alice', message: "My second message, how are you all?" },
                { author: 'Alice', message: "My first message" },
            ],
            messagingRepository: messagingFixture.getRepository()
        })
    })
});