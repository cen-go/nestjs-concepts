import {
  Controller,
  UseGuards,
  UseInterceptors,
  Post,
  UploadedFile,
  Body,
  BadRequestException,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      new BadRequestException('File is required!');
    }

    return this.fileUploadService.uploadFile(
      file,
      uploadFileDto.description,
      user,
    );
  }

  @Get()
  findAll() {
    return this.fileUploadService.findAll();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteFile(@Param('id') id: string) {
    return this.fileUploadService.deleteFile(id);
  }
}
