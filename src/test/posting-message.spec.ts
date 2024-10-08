import { EmptyMessageError, MessageTooLongError, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";
import { messageBuilder } from "./message.builder";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";

describe("Feature: Posting a message", () => {
    let fixture: MessagingFixture;

    beforeEach(() => {
        fixture = createMessagingFixture();
    });

    describe("Rule: A message can contain a maximum of 280 characters", () => {

        test("Alice can post a message on a timeline", async () => {
            fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

            const aliceMessagebuilder = messageBuilder()
                .withId("message-id")
                .withText("Hello World")
                .authoredBy("Alice")
                .withDate(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage(aliceMessagebuilder.build())

            await fixture.thenMessageShouldBe(aliceMessagebuilder.build())
        });

        test("Alice cannot post a message with more than 280 characters", async () => {
            const textWithLengthOf281 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nisl ipsum,  condimentum ut euismod et, volutpat non mauris. Morbi congue, urna semper pretium congue, tortor augue finibus lorem, ut aliquet ante ex at ligula. Maecenas bibendum diam vitae felis rutrum placerat.";

            await fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage(
                messageBuilder().withId("message-id").withText(textWithLengthOf281).authoredBy("Alice").build()
            );

            await fixture.thenErrorShouldBe(MessageTooLongError);

        });
    });

    describe("Rule: A message cannot be empty", () => {

        test("Alice cannot post an empty message", async () => {
            await fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage(
                messageBuilder().withId("message-id").withText("").authoredBy("Alice").build()
            );

            await fixture.thenErrorShouldBe(EmptyMessageError);
        });

        test("Alice cannot post a message with only whitespace", async () => {
            await fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage(
                messageBuilder().withId("message-id").withText("     ").authoredBy("Alice").build()
            );

            await fixture.thenErrorShouldBe(EmptyMessageError);
        });

    });
});
