const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const suggestion = require('../../models/SuggestionSchema');
const formatResults = require('../../utils/formatResults');

module.exports = {
    name: 'suggestion',
    description: 'Настройте систему опросов.',
    options: [
        {
            name: 'setup',
            description: 'Настройка систему опросов.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Выберете канал',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'disable',
            description: 'Настройка систему опросов',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'submit',
            description: 'Отправьте свой опрос',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'suggestion',
                    description: 'Опишите свой опрос.',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ]
        }
    ],

    async callback (client, interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        const Schannel = options.getChannel('channel');
        const Data = await suggestion.findOne({ GuildID: interaction.guild.id });
        const suggestmsg = options.getString('suggestion');

        switch (sub) {
            case 'setup':

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `Вы не можете использовать эту команду!`, ephemeral: true });

            if (Data) {

                const channel = client.channels.cache.get(Data.ChannelID);

                return await interaction.reply({ content: `У вас уже есть настроенная система опросов в  ${channel}!`, ephemeral: true });
            } else {

                await suggestion.create({
                    GuildID: interaction.guild.id,
                    ChannelID: Schannel.id
                })

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`})
                .setTitle('Success!')
                .setDescription(`<a:AUSC_checked:1011088709266985110>・Система опросов была успешно включена в ${Schannel}!`)

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'disable':

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You can't use this command!`, ephemeral: true });

            if (!Data) {
                return await interaction.reply({ content: `У вас нет системы опросов!`, ephemeral: true });
            } else {

                await suggestion.deleteMany({
                    GuildID: interaction.guild.id
                });

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`})
                .setTitle('Success!')
                .setDescription(`:2galochka:・Система предложений была успешно включена !`)

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'submit':

            if (!Data) {
                return await interaction.reply({ content: `У вас нет системы опросов!`, ephemeral: true });
            } else {

                const schannel = Data.ChannelID;
                const suggestionchannel = interaction.guild.channels.cache.get(schannel);

                const num1 = Math.floor(Math.random() * 256);
                const num2 = Math.floor(Math.random() * 256);
                const num3 = Math.floor(Math.random() * 256);
                const num4 = Math.floor(Math.random() * 256);
                const num5 = Math.floor(Math.random() * 256);
                const num6 = Math.floor(Math.random() * 256);
                const SuggestionID = `${num1}${num2}${num3}${num4}${num5}${num6}`;

                const suggestionembed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild.name}'а Система опросов`, iconURL: interaction.guild.iconURL({ size: 256 })})
                .setColor('Blurple')
                .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }))
                .setTitle(`Опрос от ${interaction.user.username}`)
                .setDescription(`> \`${suggestmsg}\``)
                .setTimestamp()
                .setFooter({ text: `ID Опроса: ${SuggestionID}`})
                .addFields({ name: 'Голоса за', value: '**No votes**', inline: true})
                .addFields({ name: 'Голоса против', value: '**No votes**', inline: true})
                .addFields({ name: `Голоса`, value: formatResults() })
                .addFields({ name: 'Автор', value: `> ${interaction.user}`, inline: false})

                const upvotebutton = new ButtonBuilder()
                .setCustomId('upv')
                .setEmoji('👍')
                .setLabel('Голоса за')
                .setStyle(ButtonStyle.Primary)

                const downvotebutton = new ButtonBuilder()
                .setCustomId('downv')
                .setEmoji('👎')
                .setLabel('Голоса против')
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
                    .setEmoji(':2galochka:')
                    .setLabel('Одобрить')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji(':2krest:')
                    .setLabel('Отклонить')
                    .setStyle(ButtonStyle.Danger)
                )

                await interaction.reply({ content: `Ваше опрос был отправлен в ${suggestionchannel}!`, ephemeral: true });
                const msg = await suggestionchannel.send({ content: `${interaction.user}'а Опрос`, embeds: [suggestionembed], components: [btnrow, button2] });
                msg.createMessageComponentCollector();

                await suggestion.create({
                    GuildID: interaction.guild.id,
                    ChannelID: suggestionchannel.id,
                    Msg: msg.id,
                    AuthorID: interaction.user.id,
                    upvotes: 0,
                    downvotes: 0,
                    Upmembers: [],
                    Downmembers: []
                })
            }
        }
    }
}
