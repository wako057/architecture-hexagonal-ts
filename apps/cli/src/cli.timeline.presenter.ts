import { Injectable } from "@nestjs/common";
import { TimelinePresenter } from "../../../libs/crafty/src/application/timeline-presenter";
import { Timeline } from "../../../libs/crafty/src/domain/timeline";
import { CustomConsoleLogger } from "./custom.console.logger";
import { DefaultTimelinePresenter } from "../../../libs/crafty/src/application/default.timeline.presenter";

@Injectable()
export class CliTimelinePresenter implements TimelinePresenter {
    constructor(
        private readonly defaultTimelinePresenter: DefaultTimelinePresenter,
        private readonly logger: CustomConsoleLogger
    ) {}

    show(timeline: Timeline): void {
        this.logger.table(this.defaultTimelinePresenter.show(timeline));
    }

}