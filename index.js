require('dotenv').config();
// File System Handler
const fs = require('fs');

// Discord setup
const discord = require('discord.js');
const client = new discord.Client();
const TOKEN = process.env.TOKEN;
// Setup commands
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set the new command in the collection
  // with the key as the command name and the value as the module
  client.commands.set(command.name, command);
}
const commandPrefix = '!';

// Youtube Notifier
const YouTubeNotifier = require('youtube-notification');
const youtube = new YouTubeNotifier({
  hubCallback: 'http://api.webhookinbox.com/i/zxDPxnp0/in/',
  port: 3000,
  secret: process.env.YT_SECRET,
})
youtube.setup();

// Begin actual client

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (!message.content.startsWith(commandPrefix) || message.author.bot) return;
  // Split args on space after prefix
  const args = message.content.slice(commandPrefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check to see if we have a command by the name that the user provided.
  // If we don't, just return
  if (!client.commands.has(commandName)) return;

  // Store the command object so we can check its properties
  const command = client.commands.get(commandName);

  // Handle the case where the user doesn't provide enough arguments
  // TODO: Consider making the command.args a number so we can validate the right quantity of args.
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${commandPrefix}${command.name} ${command.usage}\``;
    } 
    
    return message.channel.send(reply);
  }

  try {
    command.execute(message, args, youtube);
  } catch (error) {
    console.error(error);
    message.reply('There was an error while executing your command.');
  }
});

/**
 * Notifies all '#youtube-videos' channels that this bot is a member of across all guilds with the given message. This is for notifying about new YouTube videos.
 * @param {string} message The message to be sent to all channels
 */
function notifyChannels(message) {
  client.guilds.cache.map(g => {
    console.log(g);
    g.channels.cache.map(c => {
      if (c.type === 'text') {
        if (c.name === 'youtube-videos') {
          if (c.permissionsFor(client.user).has('VIEW_CHANNEL')) {
            if (c.permissionsFor(client.user).has('SEND_MESSAGES')) {
              c.send(message);
            }
          }
        }
      }
    })
  });
}

// Once the client is ready (and only once) set up and cache the channel where we will be posting videos to.
// NOTE THIS ONLY WORKS FOR GUILDS (servers) THAT HAVE A '#youtube-videos' CHANNEL!!!
client.once('ready', () => {
  client.user.setActivity('YouTube', { type: 'WATCHING' });
  notifyChannels('Ready to notify this channel about videos!');
  // Listen to the YouTube notifier and post to the channel when a message is receieved.
  youtube.on('notified', (data) => {
    notifyChannels(data);
  });
  // Subscribe to a sample channel.
  youtube.subscribe('asdhfjlasdflkjhas');
  //youtube.unsubscribe('asdhfjlasdflkjhas')
});

// Once all setup is done, login to Discord
client.login(TOKEN);