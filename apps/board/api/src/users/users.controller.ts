import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { MyCommentResponseDto } from './dto/my-comment-response.dto';
import { MyProfileResponseDto } from './dto/my-profile-response.dto';
import { UsersService } from './users.service';

@ApiTags('사용자')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({
    description: '내 프로필 조회 성공',
    type: MyProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없습니다.' })
  findMe(
    @Request() request: { user: JwtPayload },
  ): Promise<MyProfileResponseDto> {
    return this.usersService.findMyProfile(request.user.sub);
  }

  @Get('me/comments')
  @ApiOkResponse({
    description: '내 댓글 목록 조회 성공',
    type: MyCommentResponseDto,
    isArray: true,
  })
  findMyComments(
    @Request() request: { user: JwtPayload },
  ): Promise<MyCommentResponseDto[]> {
    return this.usersService.findMyComments(request.user.sub);
  }
}
