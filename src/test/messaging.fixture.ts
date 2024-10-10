import { EditMessageCommand, EditMessageUseCase } from "../edit-message.usecase";
import { Message } from "../message";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { MessageTimeline } from "../messageTimeline";
import { PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { StubDateProvider } from "./stub-date-provider";

export const createMessagingFixture = () => {
    let timeline: MessageTimeline[];
    const dateProvider = new StubDateProvider();
    const messageRepository = new InMemoryMessageRepository();
    const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
    const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
    const editMessageUseCase = new EditMessageUseCase(messageRepository);
    let thrownError: Error;

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
            timeline = await viewTimelineUseCase.handle({ user });
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
    };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;