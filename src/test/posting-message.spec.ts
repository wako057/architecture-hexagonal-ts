import { DateProvider, EmptyMessageError, Message, MessageRepository, MessageTooLongError, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";
import { InMemoryMessageRepository } from "../message.inmemory.repository";

describe("Feature: Posting a message", () => {
    let fixture: Fixture;

    beforeEach(() => {
        fixture = createFixture();
    });

    describe("Rule: A message can contain a maximum of 200 characters", () => {

        test("Alice can post a message on a timeline", async () => {
            fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage({
                id: "message-id",
                text: "Hello World",
                author: "Alice"
            })

            await fixture.thenPostedMessageShouldBe({
                id: "message-id",
                text: "Hello World",
                author: "Alice",
                publishedAt: new Date("2023-01-19T19:00:00.000Z")
            })
        });

        test("Alice cannot post a message with more than 280 characters", async () => {
            const textWithLengthOf281 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nisl ipsum,  condimentum ut euismod et, volutpat non mauris. Morbi congue, urna semper pretium congue, tortor augue finibus lorem, ut aliquet ante ex at ligula. Maecenas bibendum diam vitae felis rutrum placerat.";

            await fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage({
                id: "message-id",
                text: textWithLengthOf281,
                author: "Alice"
            });

            await fixture.thenErrorShouldBe(MessageTooLongError);

        });  
    });

    describe("Rule: A message cannot be empty", () => {

        test ("Alice cannot post an empty message", async () => {
            await fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage({
                id: "message-id",
                text: "",
                author: "Alice"
            });
    
            await fixture.thenErrorShouldBe(EmptyMessageError);
        });

        test("Alice cannot post a message with only whitespace", async () => {
            await fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            await fixture.whenUserPostMessage({
                id: "message-id",
                text: "     ",
                author: "Alice"
            });
    
            await fixture.thenErrorShouldBe(EmptyMessageError);
        });

    });
});



class StubDateProvider implements DateProvider {
    now: Date;

    getNow(): Date {
        return this.now
    }
    
}

const createFixture = () => {
    const dateProvider = new StubDateProvider();
    const messageRepository = new InMemoryMessageRepository();
    const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
    let thrownError: Error;
    let message: Message;


    return {
        givenNowIS(now: Date) {
             dateProvider.now = now;
        },
        async whenUserPostMessage(postMessageCommand: PostMessageCommand) {
            try {
                await postMessageUseCase.handle(postMessageCommand);
            } catch (err) {
                thrownError = err;
            }
        },
        thenPostedMessageShouldBe(expectedMessage: Message) {
            expect(expectedMessage).toEqual(messageRepository.message);
        },
        thenErrorShouldBe(expectedErrorClass: new () => Error) {
            expect(thrownError).toBeInstanceOf(expectedErrorClass);
        }
    };
}

type Fixture = ReturnType<typeof createFixture>;