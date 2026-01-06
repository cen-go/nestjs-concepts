import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // API Route method level metadata
        context.getClass(), // Class level metadata
      ],
    );

    if (!requiredRoles) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated!');
    }

    const hasRequiredRole = requiredRoles.some(
      (role) => role === (user as Omit<User, 'password'>).role,
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permission!');
    }

    return hasRequiredRole;
  }
}
