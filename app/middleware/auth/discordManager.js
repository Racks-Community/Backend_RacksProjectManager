const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  Colors
} = require('discord.js')

const guildId = process.env.DISCORD_GUILD_ID

const createChannels = async (name) => {
  return new Promise((resolve, reject) => {
    try {
      if (!name) {
        return reject(null)
      }
      const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
      })
      client.on('ready', async () => {
        try {
          const guild = await client.guilds.fetch(guildId)

          await guild.roles.create({
            name: name,
            color: Colors.Blue,
            reason: 'new project'
          })

          const everyone_ID = await guild.roles.everyone.id
          let projectRole = guild.roles.cache.find((r) => r.name === name)
          let adminRole = guild.roles.cache.find((r) => r.name === 'Admin')

          const permissionArgs = [
            {
              id: projectRole.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },
            {
              id: adminRole.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },
            {
              id: everyone_ID,
              deny: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            }
          ]

          const category = await guild.channels.create({
            name: name,
            type: ChannelType.GuildCategory,
            permissionOverwrites: permissionArgs
          })

          await guild.channels.create({
            name: 'Project Chat',
            type: ChannelType.GuildText,
            parent: category.id
          })

          await guild.channels.create({
            name: 'Project Team',
            type: ChannelType.GuildVoice,
            parent: category.id
          })
          resolve()
        } catch (e) {
          reject(e)
        }
      })
      client.login(process.env.DISCORD_BOT_TOKEN)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

const getInviteLink = async () => {
  return new Promise((resolve, reject) => {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
    })
    client.on('ready', async () => {
      try {
        const guild = await client.guilds.fetch(guildId)
        const invite = await guild.invites.create(
          process.env.DISCORD_WELCOME_CHANNEL_ID
        )
        resolve(`https://discord.gg/${invite.code}`)
      } catch (e) {
        reject(e)
      }
    })
    client.login(process.env.DISCORD_BOT_TOKEN)
  })
}

const grantRolesToMember = async (projectName, username) => {
  return new Promise((resolve, reject) => {
    if (!username || !projectName) {
      return reject(null)
    }
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
    })
    client.on('ready', async () => {
      try {
        const guild = await client.guilds.fetch(guildId)
        let projectRole = guild.roles.cache.find((r) => r.name === projectName)

        const memberList = await guild.members.fetch()
        memberList.map(async (member) => {
          if (member.displayName == username) {
            await member.roles.add(projectRole)
          }
        })
        resolve()
      } catch (e) {
        reject(e)
      }
    })
    client.login(process.env.DISCORD_BOT_TOKEN)
  })
}

const deleteProjectChannels = async (projectName) => {
  return new Promise((resolve, reject) => {
    if (!projectName) {
      return reject(null)
    }
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
    })
    client.on('ready', async () => {
      try {
        const guild = await client.guilds.fetch(guildId)
        const fetchedChannel = guild.channels.cache.find(
          (r) => r.name === projectName
        )
        if (fetchedChannel) {
          fetchedChannel.children.cache.map(
            async (child) => await child.delete()
          )
          await fetchedChannel.delete()
        }
        resolve(true)
      } catch (e) {
        reject(e)
      }
    })
    client.login(process.env.DISCORD_BOT_TOKEN)
  })
}

module.exports = {
  createChannels,
  getInviteLink,
  grantRolesToMember,
  deleteProjectChannels
}
