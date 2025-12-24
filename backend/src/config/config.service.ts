import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UpdateConfigDto } from './config.dto';

@Injectable()
export class ConfigService {
    private supabase: SupabaseClient;
    private readonly CONFIG_ID = 1;
    private readonly PIN_ID = 1;
    private readonly pgClient: any;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_KEY!,
        );

        const { Client } = require('pg');
        this.pgClient = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        this.pgClient.connect().catch(err => console.error('PG connect error', err));
    }

    async getConfig() {
        try {
            const res = await this.pgClient.query(
                'SELECT rate_per_unit, vat_percentage, fixed_service_charge FROM configurations WHERE id = $1',
                [this.CONFIG_ID]
            );
            const data = res.rows[0];

            if (!data) {
                return {
                    ratePerUnit: 0.15,
                    vatPercentage: 5,
                    fixedServiceCharge: 10,
                };
            }

            return {
                ratePerUnit: parseFloat(data.rate_per_unit),
                vatPercentage: parseFloat(data.vat_percentage),
                fixedServiceCharge: parseFloat(data.fixed_service_charge),
            };
        } catch (err) {
            console.error('Error fetching config via PG', err);
            throw new InternalServerErrorException('Failed to fetch configuration');
        }
    }

    async updateConfig(config: UpdateConfigDto, pin: string) {
        const isVerified = await this.verifyPin(pin);
        if (!isVerified) {
            throw new UnauthorizedException('Invalid PIN');
        }

        try {
            await this.pgClient.query(
                `INSERT INTO configurations (id, rate_per_unit, vat_percentage, fixed_service_charge)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id) DO UPDATE SET
                    rate_per_unit = EXCLUDED.rate_per_unit,
                    vat_percentage = EXCLUDED.vat_percentage,
                    fixed_service_charge = EXCLUDED.fixed_service_charge`,
                [this.CONFIG_ID, config.ratePerUnit, config.vatPercentage, config.fixedServiceCharge]
            );
            return { message: 'Configuration updated successfully' };
        } catch (err) {
            console.error('Error updating config via PG', err);
            throw new InternalServerErrorException('Failed to update configuration');
        }
    }

    async getPin() {
        try {
            const res = await this.pgClient.query('SELECT pin FROM admin_security WHERE id = $1', [this.PIN_ID]);
            return res.rows[0]?.pin || null;
        } catch (err) {
            console.error('Error fetching PIN via PG', err);
            return null;
        }
    }

    async savePin(pin: string) {
        try {
            await this.pgClient.query(
                'INSERT INTO admin_security (id, pin) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin',
                [this.PIN_ID, pin]
            );
            return { success: true };
        } catch (err) {
            console.error('Error saving PIN via PG', err);
            throw new InternalServerErrorException('Failed to save PIN');
        }
    }

    async verifyPin(pin: string): Promise<boolean> {
        const storedPin = await this.getPin();
        console.log(`Verifying PIN: input="${pin}", stored="${storedPin}"`);
        return storedPin === pin;
    }
}
