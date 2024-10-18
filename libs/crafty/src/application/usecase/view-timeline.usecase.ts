import { MessageRepository } from "../message.repository";
import { Timeline } from "../../domain/timeline";
import { TimelinePresenter } from "../timeline-presenter";
import { Injectable } from "@nestjs/common";

const ONE_MINUTE_INE_MILLISECOND = 60000;
@Injectable()
export class ViewTimelineUseCase {
    constructor(
        private readonly messageRepository: MessageRepository
    ) { };

    async handle({ user }: { user: string }, timelinePresenter: TimelinePresenter): Promise<void> {
        const messageOfUser = await this.messageRepository.getAllOfUser(user);

        const timeline = new Timeline(messageOfUser);

        timelinePresenter.show(timeline);
    };
}

