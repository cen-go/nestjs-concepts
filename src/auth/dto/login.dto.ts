import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @Min(6, { message: 'Password should be at least 4 charactes.' })
  password: string;
}
