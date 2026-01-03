import { Injectable, NotFoundException } from '@nestjs/common';
import { PostType } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  private posts: PostType[] = [
    {
      id: 1,
      title: 'First',
      content: '1st post content',
      authorName: 'cengiz',
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Irina Tretyak',
      content: 'Most wornderful jurist',
      authorName: 'Irina',
      createdAt: new Date(),
    },
  ];

  findAll() {
    return this.posts;
  }

  searchPost(query: string) {
    const extractedPosts = this.posts.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase()),
    );

    return extractedPosts;
  }

  findPostById(id: number) {
    const singlePost = this.posts.find((post) => post.id === id);

    if (!singlePost) {
      throw new NotFoundException('Post not found.');
    }

    return singlePost;
  }

  createPost(data: Omit<PostType, 'id' | 'createdAt'>) {
    const newPost: PostType = {
      ...data,
      id: this.getNextId(),
      createdAt: new Date(),
    };

    this.posts.push(newPost);
    return newPost;
  }

  update(id: number, data: Partial<Omit<PostType, 'id' | 'createdAt'>>) {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException('Post not found.');
    }
    this.posts[postIndex] = {
      ...this.posts[postIndex],
      ...data,
      updatedAt: new Date(),
    };

    return this.posts[postIndex];
  }

  deletePost(id: number): { message: string } {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex === -1) {
      throw new NotFoundException('Post not found.');
    }
    const deletedPost = this.posts.splice(postIndex, 1);

    return {
      message: `Post #${deletedPost[0].id} with title "${deletedPost[0].title}" deleted.`,
    };
  }

  private getNextId() {
    const nextId =
      this.posts.length > 0 ? this.posts[this.posts.length - 1].id++ : 1;

    return nextId;
  }
}
