import { defineConfig} from 'vitest/config';
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/main.ts', 'src/config/**'],
            exclude: ['src/main.ts', 'src/config/**'],
        },
    },
    resolve: {
        alias: {
            '@domain': path.resolve(__dirname, 'src/domain'),
            '@application': path.resolve(__dirname, 'src/application'),
            '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
            '@config': path.resolve(__dirname, 'src/config'),
        }
    },
});