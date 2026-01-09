import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

interface LoginReqBody {
  email: string;
  password: string;
}

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const reqBody = req.body as LoginReqBody;
    const email = reqBody.email || 'anonymous';
    return Promise.resolve(`login-${email}`);
  }

  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many attempts. Please try again after 1 minute',
    );
  }
}
