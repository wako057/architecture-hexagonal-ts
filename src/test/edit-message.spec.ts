import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";
import { messageBuilder } from "./message.builder";
import { EmptyMessageError, MessageTooLongError } from "../message";

describe("Feature: editing a message", () => {
    let fixture: MessagingFixture;

    beforeEach(() => {
        fixture = createMessagingFixture();
    })
    describe("Rule: editing text should not be superior to 280 characters", () => {

        test("Alice can edit her message to text inferior to 280 characters", async () => {
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

            await fixture.thenMessageShouldBe(
                aliceMessagebuilder.withText("Hello World").build()
            )
        });

        test("Alice cannot edit her message to a text superior to 280 characters", async () => {
            const textWithLengthOf281 = "Lorem ipsum dolor sit ame t, consectetur adipiscing elit. Pellentesque nisl ipsum,  condimentum ut euismod et, volutpat non mauris. Morbi congue, urna semper pretium congue, tortor augue finibus lorem, ut aliquet ante ex at ligula. Maecenas bibendum diam vitae felis rutrum placerat.";

            const originalAliceMessage = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello World")
                .build();

            fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

            await fixture.whenUserEditMessage({
                messageId: originalAliceMessage.id,
                text: textWithLengthOf281,
            });

            await fixture.thenMessageShouldBe(originalAliceMessage);

            fixture.thenErrorShouldBe(MessageTooLongError);
        });

        test("Alice cannot edit her message to an empty text", async () => {
            const originalAliceMessage = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello World")
                .build();

            fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

            await fixture.whenUserEditMessage({
                messageId: originalAliceMessage.id,
                text: "",
            });

            await fixture.thenMessageShouldBe(originalAliceMessage);

            fixture.thenErrorShouldBe(EmptyMessageError);
        });

        test("Alice cannot edit her message with only empty space", async () => {
            const originalAliceMessage = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello World")
                .build();

            fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

            await fixture.whenUserEditMessage({
                messageId: originalAliceMessage.id,
                text: "    ",
            });

            await fixture.thenMessageShouldBe(originalAliceMessage);

            fixture.thenErrorShouldBe(EmptyMessageError);
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