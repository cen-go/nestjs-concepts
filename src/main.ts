import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validating incoming request bodies automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // If set to true, validator will strip validated (returned) object of any properties that do not use any validation decorators.
      forbidNonWhitelisted: true, // If set to true, instead of stripping non-whitelisted properties validator will throw an exception.
      transform: true,
      disableErrorMessages: false, // If set to true, validation errors will not be returned to the client.
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
