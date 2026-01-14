import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { UserRegisteredEvent } from '../user-events.service';

@Injectable()
export class UserRegisteredListener {
  private readonly logger = new Logger(UserRegisteredListener.name);

  @OnEvent('user.registered')
  handleUserRegisteredEvent(payload: UserRegisteredEvent) {
    const { user, timestamp } = payload;

    this.logger.log(
      `Welcome, ${user.name}. Your account created at ${timestamp.toISOString()}`,
    );
  }
}
