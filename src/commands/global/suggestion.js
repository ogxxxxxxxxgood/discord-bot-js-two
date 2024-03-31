const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const suggestion = require('../../models/SuggestionSchema');
const formatResults = require('../../utils/formatResults');

module.exports = {
    name: 'suggestion',
    description: 'Configure the suggestion system.',
    options: [
        {
            name: 'setup',
            description: 'Setup a suggestion system.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'Input a channel.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'disable',
            description: 'Setup a suggestion system.',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'submit',
            description: 'Submit a suggestion.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'suggestion',
                    description: 'Input a suggestion.',
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

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You can't use this command!`, ephemeral: true });

            if (Data) {

                const channel = client.channels.cache.get(Data.ChannelID);

                return await interaction.reply({ content: `You already have a suggestion system **setup** in ${channel}!`, ephemeral: true });
            } else {

                await suggestion.create({
                    GuildID: interaction.guild.id,
                    ChannelID: Schannel.id
                })

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`})
                .setTitle('Success!')
                .setDescription(`<a:AUSC_checked:1011088709266985110>・The suggestion system has been successfully **setup** in ${Schannel}!`)

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'disable':

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You can't use this command!`, ephemeral: true });

            if (!Data) {
                return await interaction.reply({ content: `You don't a suggestion system **setup**!`, ephemeral: true });
            } else {

                await suggestion.deleteMany({
                    GuildID: interaction.guild.id
                });

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`})
                .setTitle('Success!')
                .setDescription(`<a:AUSC_checked:1011088709266985110>・The suggestion system has been successfully **disable**!`)

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            break;
            case 'submit':

            if (!Data) {
                return await interaction.reply({ content: `You don't have a suggestion system **setup**!`, ephemeral: true });
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
                .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`, iconURL: interaction.guild.iconURL({ size: 256 })})
                .setColor('Blurple')
                .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }))
                .setTitle(`Suggestion from ${interaction.user.username}`)
                .setDescription(`> \`${suggestmsg}\``)
                .setTimestamp()
                .setFooter({ text: `Suggestion ID: ${SuggestionID}`})
                .addFields({ name: 'Upvotes', value: '**No votes**', inline: true})
                .addFields({ name: 'Downvotes', value: '**No votes**', inline: true})
                .addFields({ name: `Votes`, value: formatResults() })
                .addFields({ name: 'Author', value: `> ${interaction.user}`, inline: false})

                const upvotebutton = new ButtonBuilder()
                .setCustomId('upv')
                .setEmoji('<:tup:1162598259626352652>')
                .setLabel('Upvote')
                .setStyle(ButtonStyle.Primary)

                const downvotebutton = new ButtonBuilder()
                .setCustomId('downv')
                .setEmoji('<:tdown:1162598331390889994>')
                .setLabel('Downvote')
                .setStyle(ButtonStyle.Primary)

                const totalvotesbutton = new ButtonBuilder()
                .setCustomId('totalvotes')
                .setEmoji('💭')
                .setLabel('Votes')
                .setStyle(ButtonStyle.Secondary)

                const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setEmoji('<a:AUSC_checked:1011088709266985110>')
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji('<a:rejected:1162622460835922043>')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                )

                await interaction.reply({ content: `Your suggestion has been submitted in ${suggestionchannel}!`, ephemeral: true });
                const msg = await suggestionchannel.send({ content: `${interaction.user}'s Suggestion`, embeds: [suggestionembed], components: [btnrow, button2] });
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