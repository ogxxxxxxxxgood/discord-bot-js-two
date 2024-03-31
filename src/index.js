require('dotenv').config();
const { Events, Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Suggestions
const suggestion = require('./models/SuggestionSchema');
const formatResults = require('./utils/formatResults');

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.isButton) return;

    const data = await suggestion.findOne({ GuildID: interaction.guild.id, Msg: interaction.message.id });
    if (!data) return;
    const message = await interaction.channel.messages.fetch(data.Msg);

    if (interaction.customId == 'upv') {
        if (data.Upmembers.includes(interaction.user.id)) return await interaction.reply({content: `Вы не можете голосовать повторно! Вы уже проголосовали против этого предложения.`, ephemeral: true});

        let Downvotes = data.downvotes;
        if (data.Downmembers.includes(interaction.user.id)) {
            Downvotes = Downvotes - 1;
        }

        if (data.Downmembers.includes(interaction.user.id)) {

            data.downvotes = data.downvotes - 1;
        }

        data.Upmembers.push(interaction.user.id);
        data.Downmembers.pull(interaction.user.id);

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setFields({name: `За`, value: `> **${data.upvotes + 1}** Votes`, inline: true}, { name: `Против`, value: `> **${Downvotes}** Голоса`, inline: true}, {name: `Автор`, value: `> <@${data.AuthorID}>`}, { name: `Голоса`, value: formatResults(data.Upmembers, data.Downmembers)});

                const upvotebutton = new ButtonBuilder()
                .setCustomId('upv')
                .setEmoji('👍')
                .setLabel('Голос за')
                .setStyle(ButtonStyle.Primary)

                const downvotebutton = new ButtonBuilder()
                .setCustomId('downv')
                .setEmoji('👎')
                .setLabel('Голос против')
                .setStyle(ButtonStyle.Primary)

                const totalvotesbutton = new ButtonBuilder()
                .setCustomId('totalvotes')
                .setEmoji('👀')
                .setLabel('Голоса')
                .setStyle(ButtonStyle.Secondary)

                const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setLabel('Одобрить')
                    .setEmoji('<a:AUSC_checked:1011088709266985110>')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji(':2krest:')
                    .setLabel('Отклонить')
                    .setStyle(ButtonStyle.Danger)
                )

                upvotebutton.setDisabled(true);
                downvotebutton.setDisabled(true);

                await interaction.update({ embeds: [newEmbed], components: [btnrow, button2] });

                data.upvotes++;
                data.save();
    }

    if (interaction.customId == 'downv') {

        if (data.Downmembers.includes(interaction.user.id)) return await interaction.reply({ content: `You cannot vote again! You have already sent an downvote on this suggestion.`, ephemeral: true});

        let Upvotes = data.upvotes;
        if (data.Upmembers.includes(interaction.user.id)) {
            Upvotes = Upvotes - 1;
        }

        if (data.Upmembers.includes(interaction.user.id)) {

            data.upvotes = data.upvotes - 1;
        }

        data.Downmembers.push(interaction.user.id);
        data.Upmembers.pull(interaction.user.id);

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setFields({name: `Upvotes`, value: `> **${Upvotes}** Votes`, inline: true}, { name: `Downvotes`, value: `> **${data.downvotes + 1}** Votes`, inline: true}, {name: `Author`, value: `> <@${data.AuthorID}>`}, { name: `Votes`, value: formatResults(data.Upmembers, data.Downmembers)});

                const upvotebutton = new ButtonBuilder()
                .setCustomId('upv')
                .setEmoji('<:tup:1162598259626352652>')
                .setLabel('Голос за')
                .setStyle(ButtonStyle.Primary)

                const downvotebutton = new ButtonBuilder()
                .setCustomId('downv')
                .setEmoji('👎')
                .setLabel('Голос против')
                .setStyle(ButtonStyle.Primary)

                const totalvotesbutton = new ButtonBuilder()
                .setCustomId('totalvotes')
                .setEmoji('👀')
                .setLabel('Голоса')
                .setStyle(ButtonStyle.Secondary)

                const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setLabel('Одобрить')
                    .setEmoji(':2galochka:')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji(':2krest:')
                    .setLabel('Отклонить')
                    .setStyle(ButtonStyle.Danger)
                )

                upvotebutton.setDisabled(true);
                downvotebutton.setDisabled(true);

                await interaction.update({ embeds: [newEmbed], components: [btnrow, button2] });

                data.downvotes++;
                data.save();
    }

    if (interaction.customId == 'totalvotes') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        let upvoters = [];
        await data.Upmembers.forEach(async member => {
            upvoters.push(`<@${member}>`)
        });

        let downvoters = [];
        await data.Downmembers.forEach(async member => {
            downvoters.push(`<@${member}>`)
        });

        const embed = new EmbedBuilder()
        .addFields({ name: `Голоса за (${upvoters.length})`, value: `> ${upvoters.join(', ').slice(0, 1020) || `Нет голосов за!`}`, inline: true})
        .addFields({ name: `Голоса против (${downvoters.length})`, value: `> ${downvoters.join(', ').slice(0, 1020) || `Нет голосов против!`}`, inline: true})
        .setColor('Random')
        .setTimestamp()
        .setFooter({ text: `👀 Дата голосования`})
        .setAuthor({ name: `${interaction.guild.name}'а Система опросов`})

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId == 'appr') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setColor('Green').setDescription('<a:AUSC_checked:1011088709266985110> Your suggestion has been approved!')

        await interaction.update({ embeds: [newEmbed], components: [message.components[0]] });
    }

    if (interaction.customId == 'rej') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setColor('Red').setDescription('<a:rejected:1162622460835922043> Your suggestion has been rejected!')

        await interaction.update({ embeds: [newEmbed], components: [message.components[0]] });
    }
})

eventHandler(client);

client.login(process.env.TOKEN);

// connection
(async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to DB.');
  
      eventHandler(client);
  
      client.login(process.env.TOKEN);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  })();
