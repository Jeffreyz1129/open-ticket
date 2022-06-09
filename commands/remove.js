const discord = require('discord.js')
const bot = require('../index')
const client = bot.client
const config = bot.config
const log = bot.errorLog.log

module.exports = () => {
    client.on("messageCreate",msg => {
        if (!msg.content.startsWith(config.prefix+"remove")) return
        var user = msg.mentions.users.first()
        if (!user) return msg.channel.send({embeds:[bot.errorLog.invalidArgsMessage("Missing Argument `<user>`:\n`"+config.prefix+"remove <user>`")]})

        if (!msg.member.permissions.has("MANAGE_CHANNELS") && !msg.member.permissions.has("ADMINISTRATOR")){
            return msg.channel.send({embeds:[bot.errorLog.noPermsMessage]})
        }

        msg.channel.messages.fetchPinned().then(msglist => {
            var firstmsg = msglist.last()

            if (firstmsg == undefined || firstmsg.author.id != client.user.id) return msg.channel.send({embeds:[bot.errorLog.notInATicket]})

            msg.channel.permissionOverwrites.delete(user.id)
            msg.channel.send({embeds:[bot.errorLog.success("User removed!",user.tag+" is removed from this ticket")]})

            var loguser = msg.mentions.users.first()
            
            log("command","someone used the 'remove' command",[{key:"user",value:msg.author.tag}])
            log("system","user removed from ticket",[{key:"user",value:msg.author.tag},{key:"ticket",value:msg.channel.name},{key:"removed_user",value:loguser.tag}])
        })
        
    })

    client.on("interactionCreate",(interaction) => {
        if (!interaction.isCommand()) return
        if (interaction.commandName != "remove") return
        const user = interaction.options.getUser("user")

        const permsmember = client.guilds.cache.find(g => g.id == interaction.guild.id).members.cache.find(m => m.id == interaction.member.id)
            if (config.main_adminroles.some((item)=>{return interaction.guild.members.cache.find((m) => m.id == interaction.member.id).roles.cache.has(item)}) == false && permsmember.permissions.has("ADMINISTRATOR")){
                interaction.reply({embeds:[bot.errorLog.noPermsMessage]})
                return
            }
        


        interaction.channel.messages.fetchPinned().then(msglist => {
            var firstmsg = msglist.last()

            if (firstmsg == undefined || firstmsg.author.id != client.user.id) return interaction.reply({embeds:[bot.errorLog.notInATicket]})

            interaction.channel.permissionOverwrites.delete(user.id)
            interaction.reply({embeds:[bot.errorLog.success("User removed!",user.tag+" is removed from this ticket")]})

            var loguser = user
            
            log("command","someone used the 'remove' command",[{key:"user",value:interaction.user.tag}])
            log("system","user removed from ticket",[{key:"user",value:interaction.user.tag},{key:"ticket",value:interaction.channel.name},{key:"removed_user",value:loguser.tag}])
        })

       
    })
}