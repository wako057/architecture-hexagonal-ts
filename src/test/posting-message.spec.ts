import { DateProvider, EmptyMessageError, Message, MessageRepository, MessageTooLongError, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";


describe("Feature: Posting a message", () => {
    let fixture: Fixture;

    beforeEach(() => {
        fixture = createFixture();
    });

    describe("Rule: A message can contain a maximum of 200 characters", () => {

        test("Alice can post a message on a timeline", () => {
            fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            fixture.whenUserPostMessage({
                id: "message-id",
                text: "Hello World",
                author: "Alice"
            })

            fixture.thenPostedMessageShouldBe({
                id: "message-id",
                text: "Hello World",
                author: "Alice",
                publishedAt: new Date("2023-01-19T19:00:00.000Z")
            })
        });

        test("Alice cannot post a message with more than 280 characters", () => {
            const textWithLengthOf281 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nisl ipsum,  condimentum ut euismod et, volutpat non mauris. Morbi congue, urna semper pretium congue, tortor augue finibus lorem, ut aliquet ante ex at ligula. Maecenas bibendum diam vitae felis rutrum placerat.";

            fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            fixture.whenUserPostMessage({
                id: "message-id",
                text: textWithLengthOf281,
                author: "Alice"
            });

            fixture.thenErrorShouldBe(MessageTooLongError);

        });  
    });

    describe("Rule: A message cannot be empty", () => {
        test ("Alice cannot post an empty message", () => {
            fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            fixture.whenUserPostMessage({
                id: "message-id",
                text: "",
                author: "Alice"
            });
    
            fixture.thenErrorShouldBe(EmptyMessageError);
        });

        test("Alice cannot post a message with only whitespace", () => {
            fixture.givenNowIS(new Date("2023-01-19T19:00:00.000Z"));

            fixture.whenUserPostMessage({
                id: "message-id",
                text: "     ",
                author: "Alice"
            });
    
            fixture.thenErrorShouldBe(EmptyMessageError);
        });

    });
});


class InMemoryMessageRepository implements MessageRepository {
    message: Message;

    save(msg: Message): void {
        this.message = msg;

    }
}

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
        whenUserPostMessage(postMessageCommand: PostMessageCommand) {
            try {
                postMessageUseCase.handle(postMessageCommand);
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