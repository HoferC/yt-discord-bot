module.exports = {
	name: 'sub',
    description: 'Subscribe to the given channel',
    args: true,
    usage: '<YouTube Channel Link>',
    guildOnly: true,
	execute(message, args, youtube) {
        message.channel.send('Subscribing to channel... (placeholder)');
        // Lookup the channel
        // Subscribe to the channel - how to get the youtube object?
	},
};