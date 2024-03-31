module.exports = formatResults;

const pb = {
    leGreen: '<:lefte:1162595345532985404>',
    meGreen: '<:middlee:1162595342466953256>',
    reGreen: '<:righte:1162595340675985438>',
    lfGreen: '<:leftf:1162595336636862554>',
    mfGreen: '<:middlef:1162595334552301681>',
    rfGreen: '<:rightf:1162595330823565412>',
    leRed: '<:LER:1163119224957435934>',
    meRed: '<:MER:1163119236256907438>',
    reRed: '<:RER:1163119246407106620>',
    lfRed: '<:LFR:1163119231299244204>',
    mfRed: '<:MFR:1163119240929353730>',
    rfRed: '<:RFR:1163119253575188570>',
};

function calculateColor(upvotePercentage, downvotePercentage) {
    if (upvotePercentage === 0) {
        return 'red'; // All downvotes, set to red
    } else if (downvotePercentage === 0) {
        return 'green'; // All upvotes, set to green
    } else {
        return 'mixed'; // Mixed votes, set to a mix of green and red
    }
}

function formatResults(upvotes = [], downvotes = []) {
    const totalVotes = upvotes.length + downvotes.length;
    const progressBarLength = 26; // Set the length to 26

    const upvotePercentage = upvotes.length / totalVotes;
    const downvotePercentage = downvotes.length / totalVotes;

    const color = calculateColor(upvotePercentage, downvotePercentage);

    const halfProgressBarLength = progressBarLength / 2;
    const filledSquaresGreen = Math.min(Math.round(upvotePercentage * halfProgressBarLength), halfProgressBarLength) || 0;
    const filledSquaresRed = Math.min(Math.round(downvotePercentage * halfProgressBarLength), halfProgressBarLength) || 0;

    const upPercentage = upvotePercentage * 100 || 0;
    const downPercentage = downvotePercentage * 100 || 0;

    const progressBar =
        color === 'red'
            ? pb.lfRed + pb.mfRed.repeat(halfProgressBarLength) + pb.rfRed
            : color === 'green'
            ? pb.lfGreen + pb.mfGreen.repeat(halfProgressBarLength) + pb.rfGreen
            : (filledSquaresGreen ? pb.lfGreen : pb.leGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresGreen ? pb.mfGreen : pb.meGreen) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.mfRed : pb.meRed) +
              (filledSquaresRed ? pb.rfRed : pb.reRed);

    const results = [];
    results.push(
        `:thumbsup: ${upvotes.length} upvotes (${upPercentage.toFixed(1)}%) • :thumbsdown: ${
            downvotes.length
        } downvotes (${downPercentage.toFixed(1)}%)`
    );
    results.push(progressBar);

    return results.join('\n');
}

module.exports = formatResults;
