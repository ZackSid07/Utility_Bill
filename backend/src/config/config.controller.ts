import { Controller, Get, Put, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './config.dto';

@Controller('api/config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) { }

    @Get()
    getConfig() {
        return this.configService.getConfig();
    }

    @Put()
    updateConfig(
        @Body() updateConfigDto: UpdateConfigDto,
        @Headers('x-admin-pin') pin: string,
    ) {
        if (!pin) {
            throw new UnauthorizedException('PIN is required');
        }
        return this.configService.updateConfig(updateConfigDto, pin);
    }

    @Get('pin')
    getPin() {
        return this.configService.getPin();
    }

    @Post('pin')
    savePin(@Body('pin') pin: string) {
        return this.configService.savePin(pin);
    }
}

