import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/auth/entities/user.entity';

export interface UserRegisteredEvent {
  user: {
    id: string;
    email: string;
    name: string;
  };
  timestamp: Date;
}

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Emit an user registered event
  emitUserRegistered(user: User) {
    const eventPayload: UserRegisteredEvent = {
      user: { id: user.id, email: user.email, name: user.name },
      timestamp: new Date(),
    };

    this.eventEmitter.emit('user.registered', eventPayload);
  }
}
