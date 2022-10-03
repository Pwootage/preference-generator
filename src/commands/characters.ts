import {ApplicationCommandOptionType, CommandInteraction} from "discord.js";
import {Discord, Slash, SlashGroup, SlashOption} from "discordx";
import {DB_CLIENT} from "../utils/DB.js";

@Discord()
@SlashGroup({description: "Manage WoW characters", name: "wowc"})
@SlashGroup("wowc")
export class CharacterCommands {
	@Slash({
		name: "add",
		description: "Add WoW character to profile for guild rolls",
		dmPermission: false,
	})
	async add(
		@SlashOption({
			description: "Armory URL",
			name: "url",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		url: string,
		interaction: CommandInteraction
	): Promise<void> {
		// example url: https://worldofwarcraft.com/en-us/character/us/zangarmarsh/pwesla

		const regex = /https:\/\/worldofwarcraft\.com\/.*\/character\/us\/(.*)\/(.*)/;
		const match = url.match(regex);
		if (!match) {
			interaction.reply({content: "Invalid URL", ephemeral: true});
			return;
		}
		const [realm, name] = [match[1], match[2]];

		const user = await DB_CLIENT.user.upsert({
			create: {
				id: interaction.user.id,
			},
			update: {},
			where: {
				id: interaction.user.id,
			}
		});

		const character = await DB_CLIENT.gameCharacter.findFirst({
			where: {realm, name, user},
		});
		if (character) {
			interaction.reply({content: "Character already exists", ephemeral: true});
			return;
		}

		const createdCharacter = await DB_CLIENT.gameCharacter.create({
			data: {
				realm, name, userId: user.id,
			}
		});

		if (user.selectedCharacterId === null) {
			await DB_CLIENT.user.update({
				where: {id: user.id},
				data: {selectedCharacterId: createdCharacter.id},
			});
		}

		interaction.reply({content: `Added ${name} from ${realm}`, ephemeral: true});
	}


	@Slash({
		name: "remove",
		description: "Remove WoW character",
		dmPermission: false,
	})
	async remove(
		@SlashOption({
			description: "Armory URL",
			name: "url",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: async (interaction, input) => {
				const chars = await DB_CLIENT.gameCharacter.findMany({
					where: {userId: interaction.user.id},
				});

				interaction.respond(
					chars.map(c => {return {name: `${c.name} on ${c.realm}`, value: `https://worldofwarcraft.com/en-us/character/us/${c.realm}/${c.name}`}})
						.filter(choice => choice.name.includes(interaction.options.getFocused()))
				);
			},
		})
		url: string,
		interaction: CommandInteraction
	): Promise<void> {
		const regex = /https:\/\/worldofwarcraft\.com\/.*\/character\/us\/(.*)\/(.*)/;
		const match = url.match(regex);
		if (!match) {
			interaction.reply({content: "Invalid URL", ephemeral: true});
			return;
		}
		const [realm, name] = [match[1], match[2]];

		const user = await DB_CLIENT.user.findFirst({
			where: {id: interaction.user.id},
		});
		if (!user) {
			interaction.reply({content: "User not found", ephemeral: true});
			return;
		}

		const character = await DB_CLIENT.gameCharacter.findFirst({
			where: {realm, name, user},
		});
		if (!character) {
			interaction.reply({content: "Character not found", ephemeral: true});
			return;
		}

		await DB_CLIENT.gameCharacter.delete({
			where: {id: character.id},
		});

		interaction.reply({content: `Removed ${name} from ${realm}`, ephemeral: true});
	}

	@Slash({
		name: "list",
		description: "List your registered WoW characters:",
		dmPermission: false,
	})
	async list(interaction: CommandInteraction): Promise<void> {
		const user = await DB_CLIENT.user.findFirst({
			where: {id: interaction.user.id},
		});
		const selectedCharacter = user?.selectedCharacterId;

		const chars = await DB_CLIENT.gameCharacter.findMany({
			where: {userId: interaction.user.id},
		});

		if (chars.length === 0) {
			interaction.reply({content: "No characters found", ephemeral: true});
			return;
		}

		const charList = chars
			.map(it => {
				let msg = `${it.name} on ${it.realm}: <https://worldofwarcraft.com/en-us/character/us/${it.realm}/${it.name}>`
				if (it.id == selectedCharacter) {
					msg = "✅ " + msg;
				} else {
					msg = "❌ " + msg;
				}
				return msg;
			})
			.join("\n");

		interaction.reply({content: charList, ephemeral: true, embeds: []});
	}

	@Slash({
		name: "set",
		description: "Set your current WoW character",
		dmPermission: false,
	})
	async set(
		@SlashOption({
			description: "Armory URL",
			name: "url",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: async (interaction, input) => {
				const chars = await DB_CLIENT.gameCharacter.findMany({
					where: {userId: interaction.user.id},
				});

				interaction.respond(
					chars.map(c => {return {name: `${c.name} on ${c.realm}`, value: `https://worldofwarcraft.com/en-us/character/us/${c.realm}/${c.name}`}})
						.filter(choice => choice.name.includes(interaction.options.getFocused()))
				);
			},
		})
		url: string,
		interaction: CommandInteraction
	): Promise<void> {
		const regex = /https:\/\/worldofwarcraft\.com\/.*\/character\/us\/(.*)\/(.*)/;
		const match = url.match(regex);
		if (!match) {
			interaction.reply({content: "Invalid URL", ephemeral: true});
			return;
		}
		const [realm, name] = [match[1], match[2]];

		const user = await DB_CLIENT.user.findFirst({
			where: {id: interaction.user.id},
		});
		if (!user) {
			interaction.reply({content: "User not found", ephemeral: true});
			return;
		}

		const character = await DB_CLIENT.gameCharacter.findFirst({
			where: {realm, name, user},
		});
		if (!character) {
			interaction.reply({content: "Character not found", ephemeral: true});
			return;
		}

		await DB_CLIENT.user.update({
			where: {id: user.id},
			data: {selectedCharacterId: character.id},
		});

		interaction.reply({content: `Set ${name} from ${realm} as current character`, ephemeral: true});
	}
}
