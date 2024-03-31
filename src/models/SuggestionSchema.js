const { Schema, model } = require('mongoose');

let suggestion = new Schema({
    ChannelID: String,
    GuildID: String,
    AuthorID: String,
    Msg: String,
    Upmembers: Array,
    Downmembers: Array,
    upvotes: Number,
    downvotes: Number
});

module.exports = model('suggestion', suggestion);