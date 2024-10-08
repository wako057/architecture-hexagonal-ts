import { text } from "stream/consumers";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";
import { messageBuilder } from "./message.builder";

describe("Feature: editing a message", () => {
    let fixture: MessagingFixture;

    beforeEach(() => {
        fixture = createMessagingFixture();
    })
    describe("Rule: editing text should not be superior to 280 characters", () => {

        test.skip("Alice can edit her message to text inferior to 280 characters", async () => {
            const aliceMessagebuilder = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello Wrld");

            fixture.givenTheFollowingMessagesExist([
                aliceMessagebuilder.build()
            ]);
 
            await fixture.whenUserEditMessage({
                messageId: "message-id",
                text: "Hello World",
            });

            fixture.thenMessageShouldBe(
                aliceMessagebuilder.withText("Hello World").build()
            )
        });
    });
});

                // messageBuilder()
                // .withId("message-id")
                // .authoredBy("Alice")
                // .withText("Hello Wrld")
                // .build()
                // messageBuilder(
                // {
                //     id: "message-id",
                //     author: "Alice",
                //     text: "Hello Wrld",
                // }),

                // messageBuilder()
                //     .withId("message-id")
                //     .authoredBy("Alice")
                //     .withText("Hello World")
                //     .build()

                // messageBuilder(
                //     {
                //         id: "message-id",
                //         author: "Alice",
                //         text: "Hello World",
                //     })