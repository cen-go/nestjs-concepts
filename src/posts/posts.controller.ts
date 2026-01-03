import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';

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
  getPostById(@Param('id', ParseIntPipe, PostExistsPipe) id: number) {
    return this.postService.findPostById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() data: CreatePostDto) {
    return this.postService.createPost(data);
  }

  @Put(':id')
  updatePost(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
    @Body() data: UpdatePostDto,
  ) {
    return this.postService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('id', ParseIntPipe, PostExistsPipe) id: number) {
    return this.postService.deletePost(id);
  }
}
