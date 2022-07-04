import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Bitcoin')
    .setDescription('The Bitcoin API description')
    .setVersion('1.0')
    .addTag('Bitcoin')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  await app.listen(9003).then(()=>{
    console.log(`Bitcoin Swagger Running on: http://localhost:9003/docs`);
  })
}
bootstrap();
