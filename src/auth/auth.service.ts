import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerData: RegisterDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: registerData.email,
    });

    if (existingUser) {
      return new ConflictException('Email already in use!');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerData.password, salt);

    const newUser = this.userRepository.create({
      email: registerData.email,
      name: registerData.name,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;

    return {
      user: result,
      message: 'Registration successful. Please login to continue.',
    };
  }

  async createAdmin(registerData: RegisterDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: registerData.email,
    });

    if (existingUser) {
      return new ConflictException('Email already in use!');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerData.password, salt);

    const newUser = this.userRepository.create({
      email: registerData.email,
      name: registerData.name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const savedUser = await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;

    return {
      user: result,
      message: 'Admin user created successfully.',
    };
  }

  async login(loginData: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginData.email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // Check the password
    const isPasswordCorrect = await bcrypt.compare(
      loginData.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return {
      user: result,
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: { sub: string } = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });

      const user = await this.userRepository.findOneBy({ id: payload.sub });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  }

  // Find current user by ID

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });
  }
}
