import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ILike, Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async findAll() {
    return await this.postsRepository.find({ relations: ['authorName'] });
  }

  async searchPost(query: string) {
    const extractedPosts = await this.postsRepository.find({
      where: { title: ILike(`%${query}%`) },
    });

    return extractedPosts;
  }

  async findPostById(id: string) {
    return await this.postsRepository.findOne({
      where: { id },
      relations: ['authorName'],
    });
  }

  async createPost(data: CreatePostDto, authorName: User) {
    const newPost = this.postsRepository.create({ ...data, authorName });

    return await this.postsRepository.save(newPost);
  }

  async update(id: string, data: UpdatePostDto, user: User) {
    const postToUpdate = await this.postsRepository.findOne({
      where: { id },
      relations: ['authorName'],
    });

    if (user.id !== postToUpdate?.authorName.id) {
      throw new ForbiddenException(
        "You don't have permission to update this post. You can only edit your own posts",
      );
    }

    if (!postToUpdate) {
      throw new NotFoundException('Post not found.');
    }

    if (data.title) {
      postToUpdate.title = data.title;
    }
    if (data.content) {
      postToUpdate.content = data.content;
    }

    return await this.postsRepository.save(postToUpdate);
  }

  async deletePost(id: string, user: User): Promise<{ message: string }> {
    const postToDelete = await this.postsRepository.findOne({
      where: { id },
      relations: ['authorName'],
    });

    if (!postToDelete) {
      throw new NotFoundException('Post not found');
    }

    if (user.id !== postToDelete.authorName.id) {
      throw new ForbiddenException(
        "You don't have permission to delete this post. You can only delete your own posts",
      );
    }
    await this.postsRepository.delete({ id });

    return {
      message: `Post  deleted.`,
    };
  }
}
