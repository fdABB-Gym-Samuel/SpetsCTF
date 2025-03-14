export type Class = {
	name: string;
	school: string | null;
};

export type User = {
	id: string;
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
};

export type Challenge = {
	challenge_id: string;
	points: number;
	challenge_category: Category | null;
};

export type Completion = {
	challenge: Challenge;
	user_id: string;
	when_completed: Date;
};
