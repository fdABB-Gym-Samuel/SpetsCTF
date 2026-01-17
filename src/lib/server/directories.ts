import { env } from '$env/dynamic/private';
import { dev, building } from '$app/environment';
import { cwd } from 'node:process';
import { join } from 'node:path';

export function getStateDirectory(): string {
    if (!env.STATE_DIRECTORY && dev) {
        return join(cwd(), 'tmp');
    } else if (building) {
        return '';
    } else {
        return env.STATE_DIRECTORY;
    }
}
