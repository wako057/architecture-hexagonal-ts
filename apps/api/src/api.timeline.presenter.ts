import { TimelinePresenter } from '../../../libs/crafty/src/application/timeline-presenter';
import { Timeline } from '../../../libs/crafty/src/domain/timeline';
import { FastifyReply } from 'fastify';

export class ApiTimelinePresenter implements TimelinePresenter {
    constructor(private readonly response: FastifyReply) { }
    show(timeline: Timeline): void {
        this.response.status(200).send(timeline.data);
    }

}