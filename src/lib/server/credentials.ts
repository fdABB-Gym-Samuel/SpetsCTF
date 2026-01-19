import { env } from '$env/dynamic/private';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { building, dev } from '$app/environment';

function getCredentialsDir(): string {
    if (env.CREDENTIALS_DIRECTORY) {
        return env.CREDENTIALS_DIRECTORY;
    } else {
        return '';
    }
}

export function getGithubClientId(): string {
    if (building) {
        return 'dummy';
    } else if (dev) {
        if (env.GITHUB_CLIENT_ID) {
            return env.GITHUB_CLIENT_ID;
        } else {
            throw new Error(
                'We are in dev and the environment variable $GITHUB_CLIENT_ID is set.'
            );
        }
    } else {
        const credentialsDirectory = getCredentialsDir();
        if (credentialsDirectory.length > 0) {
            try {
                const contents = readFileSync(
                    join(credentialsDirectory, 'github_client_id')
                );
                return contents.toString().trim();
            } catch {
                throw new Error(
                    'Could not read $CREDENTIALS_DIRECTORY/github_client_id.'
                );
            }
        } else {
            throw new Error('We are in prod and $CREDENTIALS_DIRECTORY is empty.');
        }
    }
}

export function getGithubClientSecret(): string {
    if (building) {
        return 'dummy';
    } else if (dev) {
        if (env.GITHUB_CLIENT_SECRET) {
            return env.GITHUB_CLIENT_SECRET;
        } else {
            throw new Error(
                'We are in dev and the environment variable $GITHUB_CLIENT_SECRET is set.'
            );
        }
    } else {
        const credentialsDirectory = getCredentialsDir();
        if (credentialsDirectory.length > 0) {
            try {
                const contents = readFileSync(
                    join(credentialsDirectory, 'github_client_secret')
                );
                return contents.toString().trim();
            } catch {
                throw new Error(
                    'Could not read $CREDENTIALS_DIRECTORY/github_client_secret.'
                );
            }
        } else {
            throw new Error('We are in prod and $CREDENTIALS_DIRECTORY is empty.');
        }
    }
}

export function getDatabaseUrl(): string {
    if (building) {
        return 'dummy';
    } else if (dev) {
        if (env.DATABASE_URL) {
            return env.DATABASE_URL;
        } else {
            throw new Error(
                'We are in dev and the environment variable $DATABASE_URL is set.'
            );
        }
    } else {
        const credentialsDirectory = getCredentialsDir();
        if (credentialsDirectory.length > 0) {
            try {
                const contents = readFileSync(
                    join(credentialsDirectory, 'database_url')
                );
                return contents.toString().trim();
            } catch {
                throw new Error('Could not read $CREDENTIALS_DIRECTORY/database_url.');
            }
        } else {
            throw new Error('We are in prod and $CREDENTIALS_DIRECTORY is empty.');
        }
    }
}
