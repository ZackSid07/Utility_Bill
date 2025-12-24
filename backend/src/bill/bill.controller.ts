import { Controller, Post, Body } from '@nestjs/common';
import { BillService } from './bill.service';

@Controller('api/calculate')
export class BillController {
    constructor(private readonly billService: BillService) { }

    @Post()
    calculateBill(@Body('units') units: number) {
        return this.billService.calculateBill(units);
    }
}
