import {
	ButtonInteraction,
	CommandInteraction,
	GuildMember,
	MessageActionRowComponentBuilder,
	PermissionFlagsBits,
	User,
} from "discord.js";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import {ButtonComponent, Discord, Slash, SlashOption} from "discordx";

@Discord()
export class GroupRoll {
	@Slash({
		name: "groll",
		description: "Group Roll",
		dmPermission: false,
	})
	async hello(
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
		// awaitinteraction.deferReply();

		const joinBtn = new ButtonBuilder()
			.setLabel("Join")
			// .setEmoji("👋")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("join-btn");
		const joinRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
			.addComponents(joinBtn);

		await interaction.reply({
			components: [joinRow],
			content: `Staring dungeon roll!`,
		});

		const rollBtn = new ButtonBuilder()
			.setLabel("Roll")
			// .setEmoji("👋")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("roll-btn");
		const rollRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
			.addComponents(rollBtn);
		await interaction.followUp({
			components: [rollRow],
			ephemeral: true,
			// content:
		});
	}

	@ButtonComponent({id: "join-btn"})
	helloBtn(interaction: ButtonInteraction): void {
		interaction.reply({
			ephemeral: true,
			content: `Joined roll`
		});
	}

	@ButtonComponent({id: "roll-btn"})
	rollBtn(interaction: ButtonInteraction): void {
		interaction.reply({
			content: `ROLLED!`
		});
	}
}
