import { v4 as uuidv4 } from 'uuid';
import { Command, CommandRunner } from 'nest-commander';
import { PostMessageCommand, PostMessageUseCase } from '../../../libs/crafty/src/application/usecase/post-message.usecase';
import { EditMessageCommand, EditMessageUseCase } from '../../../libs/crafty/src/application/usecase/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '../../../libs/crafty/src/application/usecase/follow-user.usecase';
import { ViewTimelineUseCase } from '../../../libs/crafty/src/application/usecase/view-timeline.usecase';
import { ViewWallUseCase } from '../../../libs/crafty/src/application/usecase/view-wall.usecase';
import { CliTimelinePresenter } from './cli.timeline.presenter';

@Command({ name: 'post', arguments: '<user> <message>' })
class PostCommand extends CommandRunner {
    constructor(private readonly postMessageUseCase: PostMessageUseCase) {
        super();
    }

    async run(passedParams: string[]): Promise<void> {
        const postMessageCommand: PostMessageCommand = {
            id: uuidv4(),
            author: passedParams[0],
            text: passedParams[1]
        }

        try {
            const result = await this.postMessageUseCase.handle(postMessageCommand);
            if (result.isOk()) {
                console.log("✅ Message posté");
                process.exit(0);
            }
            console.error("❌", result.error);
            process.exit(1);
        } catch (err) {
            console.error("❌", err);
            process.exit(1);
        }
    }
}

@Command({ name: 'edit', arguments: '<message-id> <message>' })
class EditCommand extends CommandRunner {
    constructor(private readonly editMessageUseCase: EditMessageUseCase) {
        super();
    }

    async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
        const editMessageCommand: EditMessageCommand = {
            messageId: passedParams[0],
            text: passedParams[1]
        }

        try {
            const result = await this.editMessageUseCase.handle(editMessageCommand);
            if (result.isOk()) {
                console.log("✅ Message edité");
                process.exit(0);
            }
            console.error("❌", result.error);
            process.exit(1);
        } catch (err) {
            console.error("❌", err);
            process.exit(1);
        }
    }
}

@Command({ name: 'follow', arguments: '<user> <followee>' })
class FollowCommand extends CommandRunner {
    constructor(private readonly followUserUserCase: FollowUserUseCase) {
        super();
    }

    async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
        const followUserCommand: FollowUserCommand = {
            user: passedParams[0],
            userToFollow: passedParams[1]
        };

        try {
            await this.followUserUserCase.handle(followUserCommand);
            console.log(`✅ Tu suis maintenant ${followUserCommand.userToFollow}`);
            process.exit(0);
        } catch (err) {
            console.error("❌", err);
            process.exit(1);
        }
    }
}

@Command({name: 'view', arguments: '<user>'})
class ViewCommand extends CommandRunner {
    constructor(
        private readonly cliPresenter: CliTimelinePresenter,
        private readonly viewTimelineUseCase: ViewTimelineUseCase
    ) {
        super();
    }

    async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
        try {
            const timeline = await this.viewTimelineUseCase.handle({ user: passedParams[0] }, this.cliPresenter);
            console.table(timeline);
            process.exit(0);
        } catch (err) {
            console.error("❌", err);
            process.exit(1);
        }
    }
}

@Command({name: 'wall', arguments: '<user>'})
class WallCommand extends CommandRunner {
    constructor(
        private readonly cliPresenter: CliTimelinePresenter,
        private readonly viewWallUseCase: ViewWallUseCase
    ) {
        super();
    }

    async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
        try {
            const timeline = await this.viewWallUseCase.handle({ user: passedParams[0] }, this.cliPresenter);
            console.table(timeline);
            process.exit(0);
        } catch (err) {
            console.error("❌", err);
            process.exit(1);
        }    }

}

export const commands = [
    PostCommand,
    EditCommand,
    FollowCommand,
    ViewCommand,
    WallCommand
];