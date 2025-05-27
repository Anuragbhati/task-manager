import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    type: 'mysql',
    url: process.env.DB_URI,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    autoLoadEntities: true,
    ssl: {
        rejectUnauthorized: false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
    },
    retryAttempts: 3,
    retryDelay: 3000,
}));