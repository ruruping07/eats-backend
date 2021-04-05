import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsModuleOptions } from './uploads.interfaces'

@Module({
  controllers: [UploadsController],
})
export class UploadsModule {
  
}