import { env } from '$env/dynamic/private';

export const StateDirectory =
    env.STATE_DIRECTORY.length > 0 ? env.STATE_DIRECTORY : '/var/lib/spetsctf';
