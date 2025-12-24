import { Module } from '@nestjs/common';
import { BillController } from './bill.controller';
import { BillService } from './bill.service';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [ConfigModule],
    controllers: [BillController],
    providers: [BillService],
})
export class BillModule { }
