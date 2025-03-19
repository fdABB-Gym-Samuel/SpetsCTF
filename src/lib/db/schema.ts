export type Class = {
	name: string;
	school: string | null;
};

export type User = {
	id: string;
	github_id: number;
	github_username: string;
	display_name: string | null;
	represents_class: string | null;
};

export enum Category {
	crypto = 'crypto',
	forensics = 'forensics',
	misc = 'misc',
	osint = 'osint',
	pwn = 'pwn',
	reversing = 'reversing',
	web = 'web'
}

export type Challenge = {
	challenge_category: Category | null;
	challenge_id: string;
	display_name: string | null;
	flag_format: string | null;
	flag: string;
	points: number;
};

export type Completion = {
	challenge: Challenge;
	user_id: string;
	when_completed: Date;
};

export type ChallengeCreation = {
	author: string;
	challenge: string;
};

export interface Session {
	id: string;
	user_id: string;
	expires_at: Date;
}
