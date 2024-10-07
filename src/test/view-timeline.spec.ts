import { Message } from "../message";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { MessageTimeline } from "../messageTimeline";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { StubDateProvider } from "./stub-date-provider";

describe("Feature: Viewing a personnal timeline", () => {
    let fixture: Fixture;

    beforeEach(() => {
        fixture = createFixture();
    });

    describe("Rule: Message are shown in reverse chronological order", () => {

        test("Alice can view 2 messages she published in her timeline", async () => {
            fixture.giverTheFollowingMessagesExist([
                {
                    author: "Alice",
                    text: "My first message",
                    id: "message-1",
                    publishedAt: new Date("2024-10-07T10:04:00.000Z")
                },
                {
                    author: "Bob",
                    text: "Hi it's Bob",
                    id: "message-2",
                    publishedAt: new Date("2024-10-07T10:05:00.000Z")
                },
                {
                    author: "Alice",
                    text: "My second message, how are you all?",
                    id: "message-3",
                    publishedAt: new Date("2024-10-07T10:06:00.000Z")
                },
                {
                    author: "Alice",
                    text: "My last message",
                    id: "message-4",
                    publishedAt: new Date("2024-10-07T10:09:30.000Z")
                },
            ]);

            fixture.givenNowIs(new Date("2024-10-07T10:10:00.000Z"));

            await fixture.wheUseSeesTheTimelineOf("Alice");

            fixture.thenUserShouldSee([
                {
                    author: "Alice",
                    text: "My last message",
                    publicationTime: "less than a minute ago",
                },
                {
                    author: "Alice",
                    text: "My second message, how are you all?",
                    publicationTime: "4 min ago",
                },
                {
                    author: "Alice",
                    text: "My first message",
                    publicationTime: "6 min ago",
                },
            ]);
        });

        const publicationTime = (now: Date, publicationTime: Date) => {
            const diff = now.getTime() - publicationTime.getTime();
            const minutes = diff / 60000;

            if (minutes < 1) {
                return "less than a minute ago";
            }

            if (minutes < 2) {
                return "1 minute ago";
            }

            return `${Math.floor(minutes)} minute ago`;
        };

        describe.only("Publication Time", () => {
            test("Should return 'less than a minute ago' when a publication date is inferior to one minute ago", () => {
                const now = new Date("2024-10-07T12:01:30.000Z");
                const publishedAt = new Date("2024-10-07T12:01:00.000Z");
                const text = publicationTime(now, publishedAt);

                expect(text).toEqual("less than a minute ago");
            })


            test("Should return '1 minute ago' when a publication date is exactly one minute ago", () => {
                const now = new Date("2024-10-07T12:02:00.000Z");
                const publishedAt = new Date("2024-10-07T12:01:00.000Z");
                const text = publicationTime(now, publishedAt);

                expect(text).toEqual("1 minute ago");
            })

            test("Should return '1 minute ago' when a publication date is exactly under 2 minute ago", () => {
                const now = new Date("2024-10-07T12:02:59.000Z");
                const publishedAt = new Date("2024-10-07T12:01:00.000Z");
                const text = publicationTime(now, publishedAt);

                expect(text).toEqual("1 minute ago");
            })

            test("Should return '2 minute ago' when a publication date is exactly between one minute and two minute ago", () => {
                const now = new Date("2024-10-07T12:03:00.000Z");
                const publishedAt = new Date("2024-10-07T12:01:00.000Z");
                const text = publicationTime(now, publishedAt);

                expect(text).toEqual("2 minute ago");
            })

            test.only("Should return 'X minute ago' when a publication date is exactly superior to 1 minute ago", () => {
                const now = new Date("2024-10-07T12:04:01.000Z");
                const publishedAt = new Date("2024-10-07T12:01:00.000Z");
                const text = publicationTime(now, publishedAt);

                expect(text).toEqual("3 minute ago");
            })

        });

    })
});



const createFixture = () => {
    let timeline: MessageTimeline[];
    const messageRepository = new InMemoryMessageRepository();
    const dateProvider = new StubDateProvider();
    const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);

    return {
        giverTheFollowingMessagesExist(messages: Message[]) {
            messageRepository.givenExistingMessages(messages);
        },
        givenNowIs(now: Date) { 
            dateProvider.now = now;
        },

        async wheUseSeesTheTimelineOf(user: string) {
            timeline = await viewTimelineUseCase.handle({ user });
        },
        thenUserShouldSee(expectedTimeline: MessageTimeline[]) {
            expect(timeline).toEqual(expectedTimeline);
        },
    };
};

type Fixture = ReturnType<typeof createFixture>;