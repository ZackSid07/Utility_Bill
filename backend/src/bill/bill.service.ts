import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class BillService {
    constructor(private readonly configService: ConfigService) { }

    async calculateBill(units: number) {
        if (units <= 0) {
            throw new BadRequestException('Units must be a positive number');
        }

        const config = await this.configService.getConfig();

        const subtotal = units * config.ratePerUnit;
        const vatAmount = subtotal * (config.vatPercentage / 100);
        const serviceCharge = config.fixedServiceCharge;
        const total = subtotal + vatAmount + serviceCharge;

        return {
            units,
            subtotal,
            vatAmount,
            serviceCharge,
            total,
        };
    }
}
