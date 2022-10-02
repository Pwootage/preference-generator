import {User} from "discord.js";

const ROLL_EXPIRE_TIME = 15 * 60 * 1000;
export class GuildRollManager {
	private static nextId = 0;
	private static guildRolls: Map<number, GuildRoll> = new Map();
	private constructor() { }

	static createGuildRoll(creator: User, playerCount: number): GuildRoll {
		const roll = new GuildRoll(this.nextId++, creator, playerCount);
		this.guildRolls.set(roll.id, roll);
		setTimeout(() => {
			GuildRollManager.deleteGuildRoll(roll.id);
		}, ROLL_EXPIRE_TIME);
		return roll;
	}

	static getGuildRoll(id: number): GuildRoll | undefined {
		return this.guildRolls.get(id);
	}

	static deleteGuildRoll(id: number): void {
		this.guildRolls.delete(id);
	}
}

export class GuildRoll {
	signedUpUsers: User[] = [];

	constructor(
		readonly id: number,
		readonly creator: User,
		readonly playerCount: number
	) {
	}

	hasSignedUp(user: User): boolean {
		return !!this.signedUpUsers.find(it => it.id == user.id);
	}

	signUp(user: User): void {
		if (this.hasSignedUp(user)) return;
		this.signedUpUsers.push(user);
	}

	unsignUp(user: User): void {
		this.signedUpUsers = this.signedUpUsers.filter(it => it.id != user.id);
	}

	roll(): User[] {
		return this.signedUpUsers
			// I don't really like this, but i guess it's fine
			.sort(() => Math.random() - 0.5)
			.slice(0, this.playerCount);
	}
}
