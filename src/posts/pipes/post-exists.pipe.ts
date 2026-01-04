import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostExistsPipe implements PipeTransform {
  constructor(private readonly postService: PostsService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: string, metadata: ArgumentMetadata) {
    try {
      await this.postService.findPostById(value);
    } catch {
      throw new NotFoundException(`Post with ID:${value} not found.`);
    }
    return value;
  }
}
