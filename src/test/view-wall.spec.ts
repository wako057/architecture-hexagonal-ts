import { FolloweeRepository } from "../application/followee.repository";
import { MessageRepository } from "../application/message.repository";
import { TimelinePresenter } from "../application/timeline-presenter";
import { ViewWallUseCase } from "../application/usecase/view-wall.usecase";
import { DefaultTimelinePresenter } from "../apps/timeline.default.presenter";
import { StubDateProvider } from "../infra/stub-date-provider";
import { createFollowingFixture, FollowingFixture } from "./following.fixture";
import { messageBuilder } from "./message.builder";
import { createMessagingFixture, MessagingFixture } from "./messaging.fixture";

describe("Feature: Viewing user wall", () => {
    let fixture: Fixture;
    let messaginFixture: MessagingFixture;
    let followingFixture: FollowingFixture;

    beforeEach(() => {
        messaginFixture = createMessagingFixture();
        followingFixture = createFollowingFixture();
        fixture = createFixture({
            messageRepository: messaginFixture.messageRepository,
            followeeRepository: followingFixture.followeeRepository,
        });
    })

    describe("Rule: All the message from user and her followees should appear in reverse chronological order", () => {

        test("Chalie can subscribes to Alice's timelines, and thus can view an agregagted list of all subscription", async () => {
            fixture.givenNowIs(new Date("2024-10-14T15:19:00.000Z"));
            messaginFixture.givenTheFollowingMessagesExist([
                messageBuilder().authoredBy("Alice").withText("I love the weather today").withDate(new Date("2024-10-14T15:04:00.000Z")).build(),
                messageBuilder().authoredBy("Bob").withText("Damn, We lost!").withDate(new Date("2024-10-14T15:05:00.000Z")).build(),
                messageBuilder().authoredBy("Charlie").withText("I'm in New York today! Anyone want to have a coffeee?").withDate(new Date("2024-10-14T15:18:30.000Z")).build(),
            ]);

            followingFixture.givenUseFollowees({
                user: "Charlie",
                followees: ["Alice"]
            })

            await fixture.whenUserSeesTheWallOf("Charlie");

            fixture.thenUserShouldSee([
                {
                    author: "Charlie",
                    text: "I'm in New York today! Anyone want to have a coffeee?",
                    publicationTime: "less than a minute ago"
                },
                {
                    author: "Alice",
                    text: "I love the weather today",
                    publicationTime: "15 minutes ago"
                }
            ]);
        })
    })
})

const createFixture = ({ messageRepository, followeeRepository }: { messageRepository: MessageRepository, followeeRepository: FolloweeRepository }) => {
    let wall: { author: string, text: string, publicationTime: string }[];
    const dateProvider = new StubDateProvider();
    const viewWallUserUserCase = new ViewWallUseCase(messageRepository, followeeRepository);
    const defaultWallPresenter = new DefaultTimelinePresenter(dateProvider);
    const wallPresenter: TimelinePresenter = {
        show(theTimeline) {
            wall = defaultWallPresenter.show(theTimeline);
        }
    }


    return {
        givenNowIs(now: Date) {
            dateProvider.now = now;
        },
        async whenUserSeesTheWallOf(user: string) {
            await viewWallUserUserCase.handle({ user }, wallPresenter);
        },
        thenUserShouldSee(expectedWall: { author: string, text: string, publicationTime: string }[]) {
            expect(wall).toEqual(expectedWall);
        },
    };
};

type Fixture = ReturnType<typeof createFixture>;