import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  getPosts(@Query('search') search: string) {
    if (search) {
      return this.postService.searchPost(search);
    }
    return this.postService.findAll();
  }

  @Get(':id')
  getPostById(@Param('id', PostExistsPipe) id: string) {
    return this.postService.findPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() data: CreatePostDto, @CurrentUser() user: User) {
    return this.postService.createPost(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updatePost(
    @Param('id', PostExistsPipe) id: string,
    @Body() data: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postService.update(id, data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(
    @Param('id', PostExistsPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postService.deletePost(id, user);
  }
}
