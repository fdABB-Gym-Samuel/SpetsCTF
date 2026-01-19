import { env } from '$env/dynamic/private';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function getCredentialsDir(): string {
    if (env.CREDENTIALS_DIRECTORY) {
        return env.CREDENTIALS_DIRECTORY;
    } else {
        return '';
    }
}

export function getGithubClientId(): string {
    const credentialsDirectory = getCredentialsDir();
    if (credentialsDirectory.length > 0) {
        const contents = readFileSync(join(credentialsDirectory, 'github_client_id'));
        return contents.toString();
    } else {
        if (env.GITHUB_CLIENT_ID) {
            return env.GITHUB_CLIENT_ID;
        } else {
            throw new Error(
                'Neither $CREDENTIALS_DIRECTORY/github_client_id nor $GITHUB_CLIENT_ID is set.'
            );
        }
    }
}

export function getGithubClientSecret(): string {
    const credentialsDirectory = getCredentialsDir();
    if (credentialsDirectory.length > 0) {
        const contents = readFileSync(
            join(credentialsDirectory, 'github_client_secret')
        );
        return contents.toString();
    } else {
        if (env.GITHUB_CLIENT_SECRET) {
            return env.GITHUB_CLIENT_SECRET;
        } else {
            throw new Error(
                'Neither $CREDENTIALS_DIRECTORY/github_client_secret nor $GITHUB_CLIENT_SECRET is set.'
            );
        }
    }
}
