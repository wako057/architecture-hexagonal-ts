import { messageBuilder } from "./message.builder";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";

describe("Feature: Viewing a personnal timeline", () => {
    let fixture: MessagingFixture;

    beforeEach(() => {
        fixture = createMessagingFixture()
    });

    describe("Rule: Message are shown in reverse chronological order", () => {

        test("Alice can view 2 messages she published in her timeline", async () => {

            fixture.givenTheFollowingMessagesExist([
                messageBuilder().authoredBy("Alice").withText("My first message").withDate(new Date("2024-10-07T10:04:00.000Z")).build(),
                messageBuilder().authoredBy("Bob").withText("Hi it's Bob").withDate(new Date("2024-10-07T10:05:00.000Z")).build(),
                messageBuilder().authoredBy("Alice").withText("My second message, how are you all?").withDate(new Date("2024-10-07T10:06:00.000Z")).build(),
                messageBuilder().authoredBy("Alice").withText("My last message").withDate(new Date("2024-10-07T10:09:30.000Z")).build(),
            ]);

            fixture.givenNowIs(new Date("2024-10-07T10:10:00.000Z"));

            await fixture.whenUserSeesTheTimelineOf("Alice");

            fixture.thenUserShouldSee([
                {
                    author: "Alice",
                    text: "My last message",
                    publicationTime: "less than a minute ago",
                },
                {
                    author: "Alice",
                    text: "My second message, how are you all?",
                    publicationTime: "4 minutes ago",
                },
                {
                    author: "Alice",
                    text: "My first message",
                    publicationTime: "6 minutes ago",
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

            return `${Math.floor(minutes)} minutes ago`;
        };

        describe("Publication Time", () => {
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

                expect(text).toEqual("2 minutes ago");
            })

            test("Should return 'X minute ago' when a publication date is exactly superior to 1 minute ago", () => {
                const now = new Date("2024-10-07T12:04:01.000Z");
                const publishedAt = new Date("2024-10-07T12:01:00.000Z");
                const text = publicationTime(now, publishedAt);

                expect(text).toEqual("3 minutes ago");
            })

        });

    })
});
