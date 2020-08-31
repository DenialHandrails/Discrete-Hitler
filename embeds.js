const { MessageEmbed } = require(`discord.js`);

exports.presEmbed = function (card1, card2, card3) {
    return new MessageEmbed()
        .setTitle(`Your Policies`)
        .setDescription(`Choose a policy to **__discard__** with the corresponding reaction!`)
        .setColor(0x54c46f)
        .setFooter(`Remember, you can always lie afterwards :)`, null)
        .addField(`-----------------------------------------------------------------------------------------------`, `⠀`, false)
        .addField(`⠀⠀⠀⠀⠀⠀${(card1 == 0) ? '🔵' : '🔴'}`, `⠀⠀⠀⠀⠀${(card1 == 0) ? "**Liberal**" : "**Fascist**"}`, true)
        .addField(`⠀⠀⠀⠀⠀⠀${(card2 == 0) ? '🔵' : '🔴'}`, `⠀⠀⠀⠀⠀${(card2 == 0) ? "**Liberal**" : "**Fascist**"}`, true)
        .addField(`⠀⠀⠀⠀⠀⠀${(card3 == 0) ? '🔵' : '🔴'}`, `⠀⠀⠀⠀⠀${(card3 == 0) ? "**Liberal**" : "**Fascist**"}`, true)
        .addField(`-----------------------------------------------------------------------------------------------`, `⠀`, false);
}

exports.chanEmbed = function (card1, card2) {
    return new MessageEmbed()
        .setTitle(`Your Policies`)
        .setDescription(`Choose a policy to **__pass__** with the corresponding reaction!`)
        .setColor(0x54c46f)
        .setFooter(`Remember, you can always lie afterwards :)`, null)
        .addField(`-----------------------------------------------------------------------------------------------`, `⠀`, false)
        .addField(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${(card1 == 0) ? '🔵' : '🔴'}`, `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${(card1 == 0) ? "**Liberal**" : "**Fascist**"}`, true)
        .addField(`⠀⠀⠀⠀⠀⠀⠀⠀${(card2 == 0) ? '🔵' : '🔴'}`, `⠀⠀⠀⠀⠀⠀⠀${(card2 == 0) ? "**Liberal**" : "**Fascist**"}`, true)
        .addField(`-----------------------------------------------------------------------------------------------`, `⠀`, false);
}

exports.electionEmbed = function (pres, chan) {
    return new MessageEmbed()
        .setTitle("Election Year")
        .setDescription(`President **${pres.username}** has elected ${chan} as Chancellor! Do you support this decision?\n\nYou have 15 seconds to react with 👍 or 👎 to cast your vote!`)
        .setThumbnail(pres.displayAvatarURL())
        .setImage(chan.displayAvatarURL())
        .setColor(0xF1A825)
        .setFooter("Be smart, only your first vote will count!", null)
}

exports.startEmbed = function (host) {
    return new MessageEmbed()
        .setTitle(`**__${host}__** is hosting a new game of Secret Hitler!`)
        .setDescription(`Use !join to hop in`)
        .setColor(0xF1A825)
        .setThumbnail('https://www.netclipart.com/pp/m/42-428729_secret-hitler-logo-png.png')
}

exports.listEmbed = function (list) {
    return new MessageEmbed()
        .setTitle(`The current players are:`)
        .setDescription(list)
        .setColor(0x32a852)
}

exports.joinEmbed = function (player) {
    return new MessageEmbed()
        .setDescription(`**${player}** has joined the game!`)
        .setColor(0x32a852)
        .setFooter("Use !leave if you want to opt out.", null)
}

exports.leaveEmbed = function (player) {
    return new MessageEmbed()
        .setDescription(`**${player}** has left the game!`)
        .setColor(0xDD413D)
        .setFooter("Join back with !join if you change your mind.", null)
}

exports.gameEmbed = function () {
    return new MessageEmbed()
        .setTitle('The game has begun!')
        .setDescription(`Distributing parties and roles now...`)
        .setColor(0xF1A825)
        .setFooter("Good luck!", null)
}

exports.investigationEmbed = function (reveal) {
    return new MessageEmbed()
        .setDescription(reveal)
        .setColor(0xF1A825)
        .setFooter("Use this information however you want.", null)
}

exports.specialPresidentEmbed = function (player) {
    return new MessageEmbed()
        .setDescription(`Congrats **${player}**, you have been chosen as the next president!`)
        .setColor(0x32a852)
        .setThumbnail('https://www.pngrepo.com/download/41964/confetti.png')
        .setFooter("Be nice everyone...", null)
}

exports.executedEmbed = function (player) {
    return new MessageEmbed()
        .setDescription(`Well ${player}, it's been an honor...`)
        .setColor(0xDD413D)
        .setThumbnail('https://img.favpng.com/25/13/1/scalable-vector-graphics-icon-png-favpng-YnzhdwEdjKtC11HCQEgN6DHUQ_t.jpg')
        .setFooter("Thank goodness they're gone, good riddance", null)
}

exports.executionEmbed = function (player, joke) {
    return new MessageEmbed()
        .setTitle(`EXECUTION`)
        .setDescription(`President ${player} now has the power to execute someone! Watch out! \n Use !execute @player to demonstrate your authority.`)
        .setColor(0xDD413D)
        .setThumbnail('https://i7.pngguru.com/preview/610/604/908/computer-icons-bullet-symbol.jpg')
        .setFooter(`Don't tell anyone, but I hope it's ${joke}...`, null)
}

exports.electedEmbed = function (pres, chan, voteYes, voteNo) {
    return new MessageEmbed()
        .setDescription(`Congratulations President ${pres} and Chancellor ${chan}, you have been elected! I will now pass out your policies.\n\nJa: ${voteYes}\nNein: ${voteNo}`)
        .setColor(0x32a852)
        .setThumbnail('https://toppng.com/uploads/preview/thumbs-up-icon-thumbs-up-green-ico-11563061698rumet96xfj.png')
        .setFooter(`They grow up so fast...`, null)
}

exports.notElectedEmbed = function (pres, chan, voteYes, voteNo) {
    return new MessageEmbed()
        .setDescription(`Sorry ${pres} and ${chan}, the people have spoken (against you). Onto our next candidates!\n\nJa: ${voteYes}\nNein:${voteNo}`)
        .setColor(0xDD413D)
        .setThumbnail('https://iconsetc.com/icons-watermarks/simple-red/bfa/bfa_thumbs-down/bfa_thumbs-down_simple-red_512x512.png')
        .setFooter(`I never trusted them anyways...`, null)
}

exports.thanksEmbed = function () {
    return new MessageEmbed()
        .setTitle('Decision received.')
        .setDescription(`Thank you for your wisdom.`)
        .setColor(0x32a852)
}

exports.nextRoundEmbed = function (pres) {
    return new MessageEmbed()
        .setTitle(`Onto our next election!`)
        .setDescription(`${pres}, you're up!`)
        .setThumbnail(pres.displayAvatarURL())
        .setColor(0xF1A825)
}

exports.policyPeekEmbed = function (deck1, deck2, deck3) {
    return new MessageEmbed()
        .setDescription(`The next 3 cards are __${(deck1) ? "Liberal" : "Fascist"}__, __${(deck2) ? "Liberal" : "Fascist"}__, and __${(deck3) ? "Liberal" : "Fascist"}__.`)
        .setColor(0xF1A825)
        .setFooter(`Use this information wisely...`, null)
}

exports.mainPolicyPeekEmbed = function (pres) {
    return new MessageEmbed()
        .setTitle('Policy Peek!')
        .setDescription(`President ${pres} will now peek at the next 3 policy cards!`)
        .setColor(0xF1A825)
        .setThumbnail('https://miro.medium.com/max/1400/1*la-lIynnl9915r-EuWM3gw.png')
        .setFooter('What an honor...', null)
}

exports.mainInvestigationEmbed = function (pres, joke) {
    return new MessageEmbed()
        .setTitle('Investigation!')
        .setDescription(`President ${pres} will now investigate a player's party loyalty! Beware! \n Use !investigate @player to reveal their secrets.`)
        .setColor(0xF1A825)
        .setThumbnail('https://www.pngkit.com/png/full/200-2000668_computer-mouse-magnifying-glass-hand-icon-magnifying-glass.png')
        .setFooter(`Personally, I've always been suspicious of ${joke}...`, null)
}

exports.mainSpecialElectionEmbed = function (pres) {
    return new MessageEmbed()
        .setTitle('Special Election!')
        .setDescription(`President ${pres} will now deem their successor! Look sharp! \n Use !nominate @player to pass the baton.`)
        .setColor(0xF1A825)
}

exports.liberalWinEmbed = function (list) {
    return new MessageEmbed()
        .setTitle('__Liberals Win!__')
        .setDescription(`Congratulations ${list}! Now we don't have to go back in time to kill Hitler!`)
        .setColor(0x6A97DD)
        .setThumbnail('https://i.imgflip.com/3olyw7.jpg')
        .setFooter('But what if *Hitler* is a time traveler?', null);
}

exports.fascistWinEmbed = function (list) {
    return new MessageEmbed()
        .setTitle('__Fascists Win!__')
        .setDescription(`Congratulations ${list}! Unfortunately, a time traveler kills Hitler the next day.`)
        .setColor(0xDD413D)
        .setThumbnail('https://a.thumbs.redditmedia.com/xGYC9xHb6ydi2mUNdmBqWZlTBh1GMg6VRjl_Q-jeK34.png')
        .setFooter('Long live the Queen!', null);
}

exports.vetoPowerEmbed = function () {
    return new MessageEmbed()
        .setTitle('Veto Power Enabled')
        .setDescription(`With 5 fascist policies on the board, I am now allowing the President and Chancellor to **veto** the pulled policies after the President has made their decision. This requires approval from **both** parties. Chancellor, use !veto if you want to propose the movement. President, use !approve or !reject accordingly.`)
        .setColor(0xF1A825)
}

exports.yesVetoEmbed = function () {
    return new MessageEmbed()
        .setTitle('Vetoed!')
        .setDescription(`The government has moved to veto this year's policies. Chancellor, please choose a random policy. I promise it will not count.`)
        .setColor(0x6A97DD)
        .setThumbnail('https://webstockreview.net/images/rome-clipart-veto-5.png')
        .setFooter('I never liked those policies anyways.', null);
}

exports.noVetoEmbed = function () {
    return new MessageEmbed()
        .setTitle('Veto Unsuccessful!')
        .setDescription(`Unfortunately, veto power requires unanimous consent. The Chancellor must choose a policy.`)
        .setColor(0xDD413D)
}

exports.electionTrackerEmbed = function (policy) {
    return new MessageEmbed()
        .setTitle('Too Much Inaction!')
        .setDescription(`It seems our governments have been a little lazy recently. Therefore, I am passing the next policy in the deck. It is: ${(policy) ? '__Liberal__' : '__Fascist__'}`)
        .setColor(0xF1A825)
}

exports.playOrderEmbed = function(list){
    return new MessageEmbed()
    .setTitle('The play order is:')
    .setDescription(list + '\n\nThe first player is President! Use !elect to nominate a Chancellor.')
    .setColor(0x32a852)
}
