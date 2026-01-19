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

function genericCredentialGetter(
    credentialName: string,
    environmentVariableName: string
): string {
    if (building) {
        return 'dummy';
    } else if (dev) {
        if (env[environmentVariableName]) {
            return env[environmentVariableName];
        } else {
            throw new Error(
                `We are in dev and the environment variable $${environmentVariableName} is missing.`
            );
        }
    } else {
        const credentialsDirectory = getCredentialsDir();
        if (credentialsDirectory) {
            try {
                const contents = readFileSync(
                    join(credentialsDirectory, credentialName),
                    'utf8'
                );
                return contents.toString().trim();
            } catch {
                throw new Error(
                    `Could not read $CREDENTIALS_DIRECTORY/${credentialName}.`
                );
            }
        } else {
            throw new Error('We are in prod and $CREDENTIALS_DIRECTORY is missing.');
        }
    }
}

export function getGithubClientId(): string {
    return genericCredentialGetter('github_client_id', 'GITHUB_CLIENT_ID');
}

export function getGithubClientSecret(): string {
    return genericCredentialGetter('github_client_secret', 'GITHUB_CLIENT_SECRET');
}

export function getDatabaseUrl(): string {
    return genericCredentialGetter('database_url', 'DATABASE_URL');
}
