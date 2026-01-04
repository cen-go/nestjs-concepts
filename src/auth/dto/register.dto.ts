import { IsEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Name is required!' })
  @IsString({ message: 'Name must be a string' })
  @Min(3, { message: 'name should be at least 3 charactes long.' })
  @Max(50, { message: 'Name can not be longer than 50 charactes.' })
  name: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @Min(6, { message: 'Password should be at least 4 charactes.' })
  password: string;
}
