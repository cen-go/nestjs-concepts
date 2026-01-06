import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Name is required!' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'name should be at least 3 charactes long.' })
  @MaxLength(50, { message: 'Name can not be longer than 50 charactes.' })
  name: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Password should be at least 6 charactes.' })
  password: string;
}
