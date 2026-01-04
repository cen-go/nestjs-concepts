import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ILike, Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async findAll() {
    return await this.postsRepository.find();
  }

  async searchPost(query: string) {
    const extractedPosts = await this.postsRepository.find({
      where: { title: ILike(`%${query}%`) },
    });

    return extractedPosts;
  }

  async findPostById(id: string) {
    return await this.postsRepository.findOneBy({ id });
  }

  async createPost(data: CreatePostDto) {
    const newPost = this.postsRepository.create({ ...data });

    return this.postsRepository.save(newPost);
  }

  async update(id: string, data: UpdatePostDto) {
    const postToUpdate = await this.postsRepository.findOneBy({ id });

    if (!postToUpdate) {
      throw new NotFoundException('Post not found.');
    }

    if (data.title) {
      postToUpdate.title = data.title;
    }
    if (data.content) {
      postToUpdate.content = data.content;
    }
    if (data.authorName) {
      postToUpdate.authorName = data.authorName;
    }

    return await this.postsRepository.save(postToUpdate);
  }

  async deletePost(id: string): Promise<{ message: string }> {
    await this.postsRepository.delete({ id });

    return {
      message: `Post  deleted.`,
    };
  }
}
