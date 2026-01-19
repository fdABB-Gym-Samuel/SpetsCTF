import { getGithubClientId, getGithubClientSecret } from '$lib/server/credentials';
import { GitHub } from 'arctic';

const clientId = getGithubClientId();
const clientSecret = getGithubClientSecret();

export const github = new GitHub(clientId, clientSecret, null);
