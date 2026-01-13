import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ILike, Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/auth/entities/user.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { FindPostsQueryDto } from './dto/find-posts-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class PostsService {
  private postListCacheKeys: Set<string> = new Set();

  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generatePostsListCacheKey(query: FindPostsQueryDto): string {
    const { page = 1, limit = 10, title } = query;
    return `posts_list_page${page}_limit${limit}_title${title || 'all'}`;
  }

  async findAll(query: FindPostsQueryDto): Promise<PaginatedResponse<Post>> {
    const cacheKey = this.generatePostsListCacheKey(query);
    this.postListCacheKeys.add(cacheKey);

    const cachedData =
      await this.cacheManager.get<PaginatedResponse<Post>>(cacheKey);

    if (cachedData) {
      console.log(`Cache Hit -----> Returning posts list from cache`);
      return cachedData;
    }

    console.log(`Cache Miss -----> Returning posts from the database`);

    const { page = 1, limit = 10, title } = query;
    const skip = limit * (page - 1);

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.authorName', 'authorName')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (title) {
      queryBuilder.andWhere('post.title ILIKE :title', { title: `%${title}%` });
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const responseResult: PaginatedResponse<Post> = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    await this.cacheManager.set(cacheKey, responseResult);

    return responseResult;
  }

  async searchPost(query: string) {
    const extractedPosts = await this.postsRepository.find({
      where: { title: ILike(`%${query}%`) },
    });

    return extractedPosts;
  }

  async findPostById(id: string) {
    const cacheKey = `post_${id}`;

    const cachedPost = await this.cacheManager.get<Post>(cacheKey);

    if (cachedPost) {
      console.log(`Cache Hit -----> Returning post list from cache`);
      return cachedPost;
    }

    console.log(`Cache Miss -----> Returning post from the database`);

    const fetchedPost = await this.postsRepository.findOne({
      where: { id },
      relations: ['authorName'],
    });

    await this.cacheManager.set(cacheKey, fetchedPost);
    return fetchedPost;
  }

  async createPost(data: CreatePostDto, authorName: User) {
    const newPost = this.postsRepository.create({ ...data, authorName });

    // Invalidate the existing cache
    await this.invalidateAllExistingListCaches();

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

    const updatedPost = await this.postsRepository.save(postToUpdate);

    await this.cacheManager.del(`post_${id}`);
    await this.invalidateAllExistingListCaches();

    return updatedPost;
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

    await this.cacheManager.del(`post_${id}`);
    await this.invalidateAllExistingListCaches();

    return {
      message: `Post  deleted.`,
    };
  }

  private async invalidateAllExistingListCaches(): Promise<void> {
    console.log(
      `Invalidating ${this.postListCacheKeys.size} list cache entries`,
    );

    for (const key of this.postListCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.postListCacheKeys.clear();
  }
}
