import { Message } from "../message";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { MessageTimeline } from "../messageTimeline";
import { ViewTimelineUseCase } from "../view-timeline.usecase";

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
            ]);

            fixture.givenNowIs(new Date("2024-10-07T10:10:00.000Z"));

            await fixture.wheUseSeesTheTimelineOf("Alice");

            fixture.thenUserShouldSee([
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
        })
    })
});



const createFixture = () => {
    let timeline: MessageTimeline[];
    const messageRepository = new InMemoryMessageRepository();
    const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);

    return {
        giverTheFollowingMessagesExist(messages: Message[]) {
            messageRepository.givenExistingMessages(messages);
        },
        givenNowIs(now: Date) { },

        async wheUseSeesTheTimelineOf(user: string) {
            timeline = await viewTimelineUseCase.handle({ user });
        },
        thenUserShouldSee(expectedTimeline: MessageTimeline[]) {
            expect(timeline).toEqual(expectedTimeline);
        },
    };
};

type Fixture = ReturnType<typeof createFixture>;