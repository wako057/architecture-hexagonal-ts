import { MessageRepository } from "../message.repository";
import { MessageTimeline } from "../../messageTimeline";
import { DateProvider } from "../date-provider";
import { Timeline } from "../../domain/timeline";
import { timeEnd } from "console";

const ONE_MINUTE_INE_MILLISECOND = 60000;
export class ViewTimelineUseCase {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly dateProvider: DateProvider 
    ) { };

    async handle({ user }: { user: string }): Promise<MessageTimeline[]> {
        const messageOfUser = await this.messageRepository.getAllOfUser(user);

        const timeline = new Timeline(messageOfUser, this.dateProvider.getNow());

        return timeline.data;
    };
}

