/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from 'kysely';

export type Category =
	| 'crypto'
	| 'forensics'
	| 'introduction'
	| 'misc'
	| 'osint'
	| 'pwn'
	| 'reversing'
	| 'web';

export type ChallengeResourceType = 'cmd' | 'file' | 'web';

export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface ChallengeResources {
	challenge: string;
	content: string;
	id: Generated<number>;
	type: Generated<ChallengeResourceType>;
}

export interface Challenges {
	anonymous_author: boolean | null;
	approved: boolean | null;
	author: string | null;
	challenge_category: Generated<Category | null>;
	challenge_id: string;
	challenge_sub_categories: string | null;
	ctf: number | null;
	description: string | null;
	display_name: string | null;
	flag: number | null;
	points: number;
}

export interface Classes {
	name: string;
	school: string | null;
}

export interface CtfEvents {
	display_name: string | null;
	end_time: Timestamp;
	id: Generated<number>;
	max_team_size: number | null;
	short_name: string;
	start_time: Timestamp;
}

export interface CtfSubmissions {
	challenge: string;
	ctf: number;
	id: Generated<number>;
	submitted_data: string | null;
	success: Generated<boolean>;
	time: Generated<Timestamp | null>;
	user_id: string;
}

export interface CtfTeams {
	ctf: number;
	id: Generated<number>;
	join_code: Generated<string>;
	name: string;
	website: string | null;
}

export interface CtfTeamsMembers {
	team: number;
	user_id: string;
}

export interface Flag {
	flag: string;
	flag_format: string | null;
	id: Generated<number>;
}

export interface Users {
	display_name: string | null;
	github_id: number;
	github_username: string | null;
	id: Generated<string>;
	is_admin: Generated<boolean | null>;
	represents_class: string | null;
}

export interface UserSessions {
	expires_at: Timestamp;
	id: string;
	user_id: string;
}

export interface WargameSubmissions {
	challenge: string;
	id: Generated<number>;
	submitted_data: string | null;
	success: Generated<boolean>;
	time: Generated<Timestamp | null>;
	user_id: string;
}

export interface DB {
	challenge_resources: ChallengeResources;
	challenges: Challenges;
	classes: Classes;
	ctf_events: CtfEvents;
	ctf_submissions: CtfSubmissions;
	ctf_teams: CtfTeams;
	ctf_teams_members: CtfTeamsMembers;
	flag: Flag;
	user_sessions: UserSessions;
	users: Users;
	wargame_submissions: WargameSubmissions;
}
