import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Password should be at least 6 charactes.' })
  password: string;
}
