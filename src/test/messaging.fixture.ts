import { EditMessageCommand, EditMessageUseCase } from "../application/usecase/edit-message.usecase";
import { Message } from "../domain/message";
import { InMemoryMessageRepository } from "../infra/message.inmemory.repository";
import { MessageTimeline } from "../messageTimeline";
import { PostMessageCommand, PostMessageUseCase } from "../application/usecase/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecase/view-timeline.usecase";
import { StubDateProvider } from "../infra/stub-date-provider";
import { DefaultTimelinePresenter } from "../apps/timeline.default.presenter";
import { TimelinePresenter } from "../application/timeline-presenter";

export const createMessagingFixture = () => {
    let timeline: MessageTimeline[];
    const dateProvider = new StubDateProvider();
    const messageRepository = new InMemoryMessageRepository();
    const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
    const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
    const editMessageUseCase = new EditMessageUseCase(messageRepository);
    let thrownError: Error;
    const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
    const timelinePresenter: TimelinePresenter = {
        show(theTimeline) {
            timeline = defaultTimelinePresenter.show(theTimeline);
        }
    }
    return {
        givenTheFollowingMessagesExist(messages: Message[]) {
            messageRepository.givenExistingMessages(messages);
        },
        givenNowIs(now: Date) {
            dateProvider.now = now;
        },
        async whenUserPostMessage(postMessageCommand: PostMessageCommand) {
            try {
                this.message = postMessageCommand;
                await postMessageUseCase.handle(postMessageCommand);
            } catch (err) {
                thrownError = err;
            }
        },
        async whenUserEditMessage(editMessageCommand: EditMessageCommand) {
            try {
                await editMessageUseCase.handle(editMessageCommand);
            } catch (err) {
                thrownError = err;
            }
        },
        async whenUserSeesTheTimelineOf(user: string) {
            await viewTimelineUseCase.handle({ user }, timelinePresenter);
        },
        thenUserShouldSee(expectedTimeline: MessageTimeline[]) {
            expect(timeline).toEqual(expectedTimeline);
        },
        async thenMessageShouldBe(expectedMessage: Message) {
            const message = await messageRepository.getById(expectedMessage.id);

            expect(message).toEqual(expectedMessage);
        },
        thenErrorShouldBe(expectedErrorClass: new () => Error) {
            expect(thrownError).toBeInstanceOf(expectedErrorClass);
        },
        messageRepository,
    };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;