import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { PostMessageCommand, PostMessageUseCase } from '@crafty/crafty/application/usecase/post-message.usecase';
import { EditMessageCommand, EditMessageUseCase } from '@crafty/crafty/application/usecase/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '@crafty/crafty/application/usecase/follow-user.usecase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecase/view-timeline.usecase';
import { ViewWallUseCase } from '@crafty/crafty/application/usecase/view-wall.usecase';
import { FastifyReply } from 'fastify';
import { ApiTimelinePresenter } from './api.timeline.presenter';


@Controller()
export class ApiController {
  constructor(
    private readonly postMessageUseCase: PostMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly viewWallUseCase: ViewWallUseCase,
  ) { }

  @Post('/post')
  async postMessage(@Body() body: { user: string, message: string }) {
    const postMessageCommand: PostMessageCommand = {
      id: uuidv4(),
      author: body.user,
      text: body.message
    }

    try {
      const result = await this.postMessageUseCase.handle(postMessageCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('edit')
  async editMessage(@Body() body: { messageId: string, message: string }) {
    const editMessageCommand: EditMessageCommand = {
      messageId: body.messageId,
      text: body.message
    }

    try {
      await this.editMessageUseCase.handle(editMessageCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('follow')
  async followUser(@Body() body: { user: string, followee: string }) {
    const followUserCommand: FollowUserCommand = {
      user: body.user,
      userToFollow: body.followee
    };

    await this.followUserUseCase.handle(followUserCommand);
  }

  @Get('view')
  async viewTimeline(
    @Query() query: { user: string },
    @Res() response: FastifyReply
  ) {
    const presenter = new ApiTimelinePresenter(response);
    await this.viewTimelineUseCase.handle(query, presenter);
  }
}
