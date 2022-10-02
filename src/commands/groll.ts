import {
	BaseInteraction,
	BaseMessageOptions,
	ButtonInteraction,
	CommandInteraction,
	InteractionCollector,
	Message,
	MessageActionRowComponentBuilder,
	MessageComponentInteraction,
	userMention,
} from "discord.js";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import {ButtonComponent, Discord, Slash, SlashOption} from "discordx";
import {GuildRoll, GuildRollManager} from "../utils/GuildRollManager.js";

@Discord()
export class GroupRoll {
	@Slash({
		name: "groll",
		description: "Group Roll",
		dmPermission: false,
	})
	async groll(
		@SlashOption({
			description: "Player count",
			name: "players",
			required: false,
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			maxValue: 5,
		})
		players: number | undefined,
		interaction: CommandInteraction
	): Promise<void> {
		const roll = GuildRollManager.createGuildRoll(interaction.user, players ?? 5);
		roll.signUp(interaction.user);
		interaction.reply(this.buildMessageContent(roll));
	}

	@ButtonComponent({id: "join-btn"})
	joinBtn(interaction: ButtonInteraction): void {
		const roll = this.rollFromInteraction(interaction);
		if (roll === undefined) return;

		roll.signUp(interaction.user);

		interaction.message.edit(this.buildMessageContent(roll));
		interaction.reply({ephemeral: true, content: `Joined roll`});
	}

	@ButtonComponent({id: "leave-btn"})
	leaveButton(interaction: ButtonInteraction): void {
		const roll = this.rollFromInteraction(interaction);
		if (roll === undefined) return;

		roll.unsignUp(interaction.user);

		interaction.message.edit(this.buildMessageContent(roll));
		interaction.reply({ephemeral: true, content: `Left roll`});
	}

	@ButtonComponent({id: "roll-btn"})
	rollBtn(interaction: ButtonInteraction): void {
		const roll = this.rollFromInteraction(interaction);
		if (roll === undefined) return;

		if (roll.creator.id !== interaction.user.id) {
			interaction.reply({
				ephemeral: true,
				content: `You didn't create this roll; only the creator can roll`,
			});
			return;
		}

		const results = roll.roll();
		let reply = `Group:`;
		if (roll.signedUpUsers.length < roll.playerCount) {
			reply = `There weren't enough player signed up, but:`;
		} else if (roll.signedUpUsers.length === roll.playerCount) {
			reply = `There were exactly enough players signed up, so:`;
		}
		for (const user of results) {
			reply += ` ${userMention(user.id)}`;
		}
		interaction.reply({
			content: reply,
			allowedMentions: {users: []},
		});
	}

	private rollFromInteraction(interaction: MessageComponentInteraction): GuildRoll | undefined {
		const rollId = this.idFromMessage(interaction.message)!;
		if (rollId === undefined) {
			// interaction.message.edit(this.buildRollEndedMessage());
			interaction.reply({...this.buildRollEndedMessage(), ephemeral: true});
			return;
		}
		const roll = GuildRollManager.getGuildRoll(rollId);
		if (roll === undefined) {
			// interaction.message.edit(this.buildRollEndedMessage());
			interaction.reply({...this.buildRollEndedMessage(), ephemeral: true});
			return;
		}
		return roll;
	}

	idFromMessage(msg: Message): number | undefined {
		const messageText = msg.content;
		const match = messageText.match(/^Dungeon roll #(\d+) /);
		if (!match) return;
		return parseInt(match[1]);
	}

	private buildMessageContent(roll: GuildRoll): BaseMessageOptions {
		// Build buttons
		const joinBtn = new ButtonBuilder()
			.setLabel("Join")
			// .setEmoji("👋")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("join-btn");

		const leaveBtn = new ButtonBuilder()
			.setLabel("Leave")
			// .setEmoji("👋")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("leave-btn");

		const rollBtn = new ButtonBuilder()
			.setLabel("Roll")
			// .setEmoji("🎲")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("roll-btn");

		const joinRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
			.addComponents(joinBtn, leaveBtn, rollBtn);


		// and then the content
		let content = `Dungeon roll #${roll.id} for ${roll.playerCount} players:`;
		content += `\nCurrent players:`;
		for (const user of roll.signedUpUsers) {
			content += ` ${userMention(user.id)}`;
		}

		return {
			components: [joinRow],
			content,
			allowedMentions: {users: []},
		};
	}

	buildRollEndedMessage(): BaseMessageOptions {
		return {
			content: `This roll has ended.`,
			components: [],
		};
	}
}
