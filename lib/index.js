const Discord = require('discord.js');
const EventEmitter = require('events');

const createLogger = require('./logger');
const createServer = require('./server');
const createState = require('./state');

function createApplication({ config }) {
  const emitter = new EventEmitter();
  const logger = createLogger({ config });
  const state = createState({ emitter });
  const { io, server } = createServer();
  const client = new Discord.Client();

  emitter.on('memberCreated', (member) => {
    logger.debug('Member "%s" joined the channel', member.name, {
      member,
    });

    io.emit('memberCreated', member);
  });

  emitter.on('memberUpdated', (member) => {
    logger.debug('Member "%s" updated', member.name, {
      member,
    });

    io.emit('memberUpdated', member);
  });

  emitter.on('memberDeleted', (member) => {
    logger.debug('Member "%s" left the channel', member.name, {
      member,
    });

    io.emit('memberDeleted', member);
  });

  server.on('listening', () => {
    logger.info('Server is listening port %d', server.address().port);
  });

  io.on('connection', (socket) => {
    socket.emit('membersReceived', state.members.values());
  });

  client.on('error', (error) => {
    logger.error(error.message, { error });
  });

  client.on('warn', (info) => {
    logger.warn(info);
  });

  client.on('ready', () => {
    const channel = client.channels.get(config.channel);

    channel.members.forEach((member) => {
      state.addMember(member);
    });

    channel.join().then((connection) => {
      logger.info('Joined voice channel "%s"', channel.name, {
        channel,
      });

      client.on('disconnect', () => {
        // Disconnect the voice connection preventing the application from being closed.
        connection.disconnect();
      });
    });
  });

  client.on('disconnect', () => {
    // Clear an unmanaged timeout preventing the application from being closed.
    clearTimeout(client.ws.connection.ratelimit.resetTimer);
  });

  client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (newMember.voiceChannelID === config.channel) {
      state.addMember(newMember);
    } else {
      state.deleteMember(newMember);
    }
  });

  client.on('guildMemberSpeaking', (member, speaking) => {
    state.updateMember(member, {
      speaking,
    });
  });

  return {
    /**
     * Start the application.
     */
    start() {
      logger.info('Starting the application...');

      server.listen(config.port);
      client.login(config.token);
    },

    /**
     * Close the application.
     */
    close() {
      logger.info('Closing the application...');

      server.close();
      client.destroy();
    },
  };
}

module.exports = createApplication;
