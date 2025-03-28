import { GitHub } from 'arctic';
import { env } from '$env/dynamic/private';
const { GITHUB_CLIENT_SECRET, GITHUB_CLIENT_ID } = env;

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);
