'use strict';

// Import the discord.js module
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const { isBuffer } = require('util');
const embeds = require('./embeds.js');
const { resolve } = require('path');

// Create an instance of a Discord client
const client = new Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
	console.log('I am ready!');
});

var players = new Array();
var playerCount = 0;
var mainChannel;
var gameState = "Waiting";
var termLimits = { pres: "", chan: "" }
var veto = { pres: false, chan: false };
var electionTracker = 0;
var libCards = ["🔹", "🔹", "🔹", "🔹", "🔹", "🆗", "🆙", "🆒", "🆕", "🆓"]
var fasCards = ["🔻", "🔻", "🔻", "🗡️", "🗡️", "💀", "🚷", "🚳", "🚱", "🔞", "📵", "☠️"]
var libPasses = 0;
var fasPasses = 0;
var specialEventsUsed = 0;
var deck = [0, 0, 0, 0, 0, 0,
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
// 0 = liberal, 1 = fascist
var discards = [];
var investigated = [];
var specialPresident = false;

// Create an event listener for messages
client.on('message', message => {
	if (message.content.substring(0, 1) == '>') {
		var args = message.content.substring(1).split(' ');
		var cmd = args[0];
		args = args.splice(1);

		switch (gameState) {
			case "Waiting":
				switch (cmd) {
					// !ping
					case 'repent':
						message.channel.send('hi jennifer');
						break;
					case 'ping':
						message.channel.send('Pong!');
						console.log(message.author.id);
						break;

					case 'credits':
						message.channel.send('Some loser named Daniel Honrales');
						break;

					case 'start':
						message.channel.send(embeds.startEmbed(message.author.username));
						players = [{ user: message.author, role: 0 }];
						mainChannel = message.channel;
						gameState = "Pending";
						break;
				}
				break;

			case "Pending":
				switch (cmd) {
					case 'list':
						var list = "**" + players[0].user.username + "** (Host)";
						players.forEach(function (player, index, array) {
							if (index != 0) {
								list += ", **" + player.user.username + "**";
							}
						});
						mainChannel.send(embeds.listEmbed(list));
						break;

					case 'join':
						if (players.length > 0) {
							if (playerExists(message.author.id)) {
								mainChannel.send(`Silly **__${message.author.username}__**, you\'ve already joined the game!`);
							} else {
								mainChannel.send(embeds.joinEmbed(message.author.username));
								players.push({ user: message.author, role: 0 });
							}
						}
						break;

					case 'leave':
						if (playerExists(message.author.id)) {
							mainChannel.send(embeds.leaveEmbed(message.author.username));
							for (var i = 0; i < players.length; i++) {
								if (players[i].user.id == message.author.id) {
									players.splice(i, 1);
								}
							}
						}
						if (players.length == 0) {
							mainChannel.send(`No humans left? Guess I'll shut down the game for now...`);
							gameState = "Waiting";
						}
						break;

					case 'allin':
						console.log('starting game')
						if (message.author.id != players[0].user.id) {
							message.channel.send(`Only the host (**${players[0].user.username}**) can start the game!`);
						} else if (players.length < 5) {
							message.channel.send(`We need at least 5 humans before starting!`);
						} else {
							mainChannel.send(embeds.gameEmbed());
							gameState = "InProgress";
							gameSetup(message.channel);
						}
						break;
				}
				break;

			case "InProgress":
				switch (cmd) {
					case 'elect':
						var chanID = parseMention(args[0]);
						var presID = message.author.id;
						if (presID != players[0].user.id || args.length != 1) {//If player is Pres
							message.channel.send(`Only the current president (**${players[0].user}**) can elect a chancellor!`);
						} else if (presID == chanID) { // Pres cannot elect himself/herself
							message.channel.send('No, you cannot elect yourself as Chancellor...');
						} else if (chanID == termLimits.chan) { // Cannot elect last chancellor
							message.channel.send('The last chancellor cannot be reelected!');
						} else if (players.length > 5 && chanID == termLimits.pres) { // Cannot elect last president
							message.channel.send(`The last president cannot be elected chancellor! (unless there are 5 humans left)`);
						} else {
							if (playerExists(chanID)) {
								var list = ""
								players.forEach(function (player, index, array) {
									list += player.user.id + ', '
								});
								message.channel.send(embeds.electionEmbed(message.author, client.users.cache.get(chanID)))
									.then(function (message) {
										message.react('👍').then(() => {
											message.react('👎').then(() => {
												isElected(message, presID, chanID);
											})
										})
									})
									.catch(function () {
										console.log('Error on election!');
									});
							} else { // User is not a player
								message.channel.send(`That human is not a citizen of our great nation! Please choose a __player__ to investigate (using their tag/mention).`);
							}
						}
						break;
					/*case 'forceend':
						gameReset();
						message.channel.send('Game over!');
						break;*/
					case 'list':
						mainChannel.send(players)
						break;
				}
				break;

			case "Election":
				if (fasPasses >= 5) {
					switch (cmd) {
						case "veto":
							if (message.author.id == termLimits.chan) {
								mainChannel.send('Chancellor has moved to veto these policies. Do you consent President?');
								veto.chan = true;
							}
							break;
						case "approve":
							mainChannel.send(embeds.yesVetoEmbed());
							veto.pres = true;
							break;
						case "reject":
							mainChannel.send(embeds.noVetoEmbed());
							veto.pres = false;
							break;
						default:
							console.log('Unrecognized command');
							break;
					}
				}
				break;

			case "Investigation":
				var suspectID = parseMention(args[0]);
				var presID = message.author.id;
				if (cmd != "investigate" || investigated.includes(suspectID)) {
					mainChannel.send("President must investigate someone (who has not been investigated before).")
				} else if (presID != players[0].user.id || args.length != 1) {
					mainChannel.send(`Only the current president (**${players[0].user}**) can investigate someone!`);
				} else if (presID == suspectID) {
					mainChannel.send(`No, you cannot investigate yourself...`);
				} else {
					if (playerExists(suspectID)) {
						var reveal = `**${client.users.cache.get(suspectID).username}** is a `;
						players.forEach(function (player, index, array) {
							if (player.user.id == suspectID) {
								switch (player.role) {
									case 0:
										reveal += "__Liberal__";
										break;
									case 1:
										reveal += "__Fascist__";
										break;
									case 2:
										reveal += "__Hitler__";
										break;
								}
								reveal += "!";
							}
						});
						message.author.send(embeds.investigationEmbed(reveal));
						nextRound();
					} else {
						mainChannel.send("Please choose a __player__ to investigate (using their tag/mention).")
					}
				}
				break;

			case "SpecialElection":
				var nomineeID = parseMention(args[0]);
				var presID = message.author.id;
				if (cmd != "nominate") {
					mainChannel.send("The current president must nominate the next president!")
				} else if (presID != players[0].user.id || args.length != 1) {
					mainChannel.send(`Only the current president (**${players[0].user}**) can nominate their successor!`);
				} else if (presID == nomineeID) {
					mainChannel.send(`No, you cannot nominate yourself...`);
				} else {
					if (playerExists(nomineeID)) {
						mainChannel.send(embeds.specialPresidentEmbed(client.users.cache.get(nomineeID)));
						nextRound();
						specialPresident = true;
						var newPres;
						players.forEach(function (player, index, array) {
							if (player.user.id == nomineeID) {
								newPres = player
							}
						});
						players.unshift(newPres);
					} else {
						mainChannel.send("Please choose a __player__ to nominate (using their tag/mention).")
					}
				}
				break;

			case "Execution":
				var convictID = parseMention(args[0]);
				var presID = message.author.id;
				if (cmd != "execute") {
					mainChannel.send("The current president must execute a player!")
				} else if (presID != players[0].user.id || args.length != 1) {
					mainChannel.send(`Only the current president (**${players[0].user}**) can execute a player!`);
				} else if (presID == convictID) {
					mainChannel.send(`No, you cannot execute yourself...`);
				} else {
					if (playerExists(convictID)) {
						mainChannel.send(embeds.executedEmbed(client.users.cache.get(convictID)));
						players.forEach(function (player, index, array) {
							if (player.user.id == convictID) {
								if (player.role == 2) {
									liberalsWin();
								} else {
									players.splice(index, 1);
									nextRound();
								}
							}
						});
					} else {
						mainChannel.send("Please choose a __player__ to execute (using their tag/mention).")
					}
				}
				break;
		}
	}
});


function playerExists(pending) {
	var bool = false;
	players.forEach(function (player, index, array) {
		if (player.user.id == pending) {
			bool = true;
		}
	});
	return bool;
}

function parseMention(mention) {
	if (mention != undefined) {
		if (mention.startsWith('<@') && mention.endsWith('>')) {
			mention = mention.slice(2, -1);

			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			}

			//return client.users.cache.get(mention);
			return mention;
		}
	}
}

function gameSetup(channel) {
	// 5 - 10 players

	var designated = new Array();
	playerCount = Math.ceil(players.length / 2) - 2;

	// Picking Hitler
	var i = Math.floor(Math.random() * (players.length));
	players[i].role = 2;
	players[i].user.send('Pssst, you are **Hitler!**');
	designated.push(i);

	// Picking Fascists
	for (var j = 0; j < playerCount; j++) {
		while (designated.includes(i)) {
			i = Math.floor(Math.random() * (players.length - 1));
		}
		players[i].role = 1;
		designated.push(i);
		players[i].user.send('Pssst, you are a **Fascist!**');
	}

	// Liberals are set by default
	players.forEach(function (player, index, array) {
		if (player.role == 0) {
			player.user.send('Pssst, you are a **Liberal!**');
		}
	});

	// Balancing
	if (players.length == 6) {
		deck.pop();
		fasCards++;
	}
	if (players.length == 7 || players.length == 9) {
		deck.pop();
		discards.push(1);
	}

	// Shuffle deck
	shuffle(deck);

	// Set play order
	shuffle(players);

	// Display play order
	var playOrder = players[0].user.username
	players.forEach(function (player, index, array) {
		if (index != 0) {
			playOrder += ", " + player.user.username
		}
	});

	// Set board
	switch (playerCount) {
		case 1:
			specialEventsUsed += 2;
			fasCards[2] = "📮";
			break;
		case 2:
			specialEventsUsed += 1;
			fasCards[1] = "🔎";
			fasCards[2] = "🎖️";
			break;
		case 3:
			fasCards[0] = "🔎";
			fasCards[1] = "🔎";
			fasCards[2] = "🎖️";
			break;
		default:
			console.log('Unknown player count');
			break;
	}

	// Send board
	mainChannel.send(buildEmbeds().libEmbed);
	mainChannel.send(buildEmbeds().fasEmbed);
	mainChannel.send(buildEmbeds().electionTrackerEmbed);
	mainChannel.send(embeds.playOrderEmbed(playOrder));
}

function nextRound() {
	if (!specialPresident) {
		players.push(players[0]);
	}
	specialPresident = false
	players.shift();
	mainChannel.send(buildEmbeds().libEmbed);
	mainChannel.send(buildEmbeds().fasEmbed);
	if (electionTracker > 0) {
		mainChannel.send(buildEmbeds().electionTrackerEmbed);
	}
	mainChannel.send(embeds.nextRoundEmbed(players[0].user));
	gameState = "InProgress";
}

function gameReset() {
	players = new Array();
	playerCount = 0;
	mainChannel;
	gameState = "Waiting";
	termLimits = { pres: "", chan: "" }
	libCards = ["🔹", "🔹", "🔹", "🔹", "🔹", "🆗", "🆙", "🆒", "🆕", "🆓"]
	fasCards = ["🔻", "🔻", "🔻", "🗡️", "🗡️", "💀", "🚷", "🚳", "🚱", "🔞", "📵", "☠️"]
	libPasses = 0;
	fasPasses = 3;
	deck = [0, 0, 0, 0, 0, 0,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	discards = [];
	investigated = [];
	specialPresident = false;
}

function shuffle(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function refillDeck() {
	if (deck.length < 3) {
		for (var i = 0; i < discards.length; i++) {
			deck.push(discards[i]);
		}
		discards = [];
		shuffle(deck);
	}
}

function buildEmbeds() {
	var libPols = "⠀⠀⠀⠀";
	for (var i = 0; i < 5; i++) {
		libPols += (i < libPasses) ? `${libCards[i + 5]}⠀⠀⠀⠀⠀⠀` : `${libCards[i]}⠀⠀⠀⠀⠀⠀`;
	}
	libPols = libPols.slice(0, -6)

	var fasPols = "⠀⠀";
	for (var i = 0; i < 6; i++) {
		fasPols += (i < fasPasses) ? `${fasCards[i + 6]}⠀⠀⠀⠀⠀` : `${fasCards[i]}⠀⠀⠀⠀⠀`;
	}
	fasPols = fasPols.slice(0, -5);

	var tracker = "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀";
	for (var i = 0; i < 3; i++) {
		tracker += (i < electionTracker) ? "🟧⠀⠀⠀⠀⠀⠀⠀⠀" : "🔸⠀⠀⠀⠀⠀⠀⠀⠀";
	}

	var libEmbed = new MessageEmbed()
		.setTitle("Liberals")
		.setDescription("-----------------------------------------------------------------------------")
		.setColor(0x6A97DD)
		.setFooter(`Pass ${libPasses}/5 Policies or Kill Hitler to Win`, null)
		.setThumbnail("https://i.imgflip.com/3olyw7.jpg")
		.addField("⠀", libPols, false)
		.addField("⠀", "-----------------------------------------------------------------------------", false);
	var fasEmbed = new MessageEmbed()
		.setTitle("Fascists")
		.setDescription("---------------------------------------------------------------------------")
		.setColor(0xDD413D)
		.setFooter(`Pass ${fasPasses}/6 Policies or Elect Hitler to Win`, null)
		.setThumbnail("https://a.thumbs.redditmedia.com/xGYC9xHb6ydi2mUNdmBqWZlTBh1GMg6VRjl_Q-jeK34.png")
		.addField("⠀", fasPols, false)
		.addField("⠀", "---------------------------------------------------------------------------", false);
	var electionTrackerEmbed = new MessageEmbed()
		.setTitle("Election Tracker")
		.setDescription("---------------------------------------------------------------------------")
		.setColor(0xF1A825)
		.setFooter(`If you fail to elect a government 3 times, I will take matters into my own hands!`, null)
		.addField("⠀", tracker, false)
		.addField("⠀", "---------------------------------------------------------------------------", false);
	return { libEmbed, fasEmbed, electionTrackerEmbed }
}

function isElected(message, presID, chanID) {
	gameState = "Election";
	var voteYes = [];
	var voteNo = [];

	const filter = (reaction, user) => {
		// Is voter a player
		var canVote = false;
		players.forEach(function (player, index, array) {
			if (player.user.id == user.id) {
				canVote = true;
			}
		});

		// Has voter already voted
		if (!voted.includes(user.id)) {
			voted.push(user.id);
		} else {
			canVote = false;
		}

		return ['👍', '👎'].includes(reaction.emoji.name) && canVote && !user.bot
	};

	const collector = message.createReactionCollector((filter), { max: ((specialPresident) ? players.length - 1 : players.length), time: 20000 });
	var votes = 0;
	var voted = new Array();

	collector.on('collect', (reaction, user) => {
		console.log('collected ' + reaction.emoji.name + "from " + user.id);
		if (reaction.emoji.name == '👍') {
			voteYes += user.username + ", ";
			votes++;
		} else {
			voteNo += user.username + ", ";
			votes--;
		}
	});

	collector.on('end', (collected, reason) => {
		console.log('votes are ' + votes + ", collected " + collected + ", and ended because " + reason);
		if (voteYes.length > 0) {
			voteYes = voteYes.slice(0, -2)
		}
		if (voteNo.length > 0) {
			voteNo = voteNo.slice(0, -2)
		}

		if (votes > 0) {
			message.channel.send(embeds.electedEmbed(client.users.cache.get(presID), client.users.cache.get(chanID), voteYes, voteNo));
			termLimits.chan = chanID;
			termLimits.pres = presID;
			sendPresCards(client.users.cache.get(presID), client.users.cache.get(chanID));
		} else {
			message.channel.send(embeds.notElectedEmbed(client.users.cache.get(presID), client.users.cache.get(chanID), voteYes, voteNo));

			// Election Tracking
			electionTracker += 1;
			if (electionTracker >= 3) {
				mainChannel.send(embeds.electionTrackerEmbed(deck[0]));
				electionTracker = 0;
				if (deck[0] == 0) {
					libPasses += 1;
				} else {
					fasPasses += 1;
				}
				deck.shift();
				refillDeck();
				termLimits = { pres: "", chan: "" };
			}

			nextRound();
		}
	});
}

function sendPresCards(pres, chan) {

	// Run cards
	console.log(`deck is ${deck}`);
	var presCards = deck.slice(0, 3);
	deck.splice(0, 3);
	console.log(`deck is now ${deck}`);
	pres.send(embeds.presEmbed(presCards[0], presCards[1], presCards[2]))
		.then(function (message) {
			if (presCards.includes(0)) {
				message.react('🔵');
			}
			if (presCards.includes(1)) {
				message.react('🔴');
			}

			presCardReaction(message, presCards, pres, chan)
		})
		.catch(() => {
			console.log('Error on sending cards to President.');
		});
}

function presCardReaction(message, choices, pres, chan) {
	const filter = (reaction, user) => {
		if (!choices.includes(0)) {
			return reaction.emoji.name == '🔴' && !user.bot
		} else if (!choices.includes(1)) {
			return reaction.emoji.name == '🔵' && !user.bot
		} else {
			return ['🔵', '🔴'].includes(reaction.emoji.name) && !user.bot
		}
	};

	const collector = message.createReactionCollector((filter), { max: 1 });

	collector.on('collect', (reaction, user) => {
		var chosen = choices.splice(choices.indexOf((reaction.emoji.name == '🔵') ? 0 : 1), 1)[0];
		console.log(`pres chose ${chosen}`);
		discards.push(chosen)
	});

	collector.on('end', (collected, reason) => {
		console.log('pres ended with ' + choices);
		message.channel.send(embeds.thanksEmbed());
		sendChanCards(pres, chan, choices);
	});
}

function sendChanCards(pres, chan, choices) {
	chan.send(embeds.chanEmbed(choices[0], choices[1]))
		.then(function (message) {
			if (choices.includes(0)) {
				message.react('🔵');
			}
			if (choices.includes(1)) {
				message.react('🔴');
			}
			chanCardReaction(pres, message, choices);
		})
		.catch(function () {
			console.log('Error on sending cards to chancellor');
		});
}

function chanCardReaction(pres, message, choices) {
	const filter = (reaction, user) => {
		if (!choices.includes(0)) {
			return reaction.emoji.name == '🔴' && !user.bot
		} else if (!choices.includes(1)) {
			return reaction.emoji.name == '🔵' && !user.bot
		} else {
			return ['🔵', '🔴'].includes(reaction.emoji.name) && !user.bot
		}
	};
	const collector = message.createReactionCollector((filter), { max: 1 });
	console.log(choices);

	collector.on('collect', (reaction, user) => {
		var chosen = choices.splice(choices.indexOf((reaction.emoji.name == '🔴') ? 0 : 1), 1)[0];
		console.log(`chan chose ${chosen}`);
		discards.push(chosen)
	});

	collector.on('end', (collected, reason) => {
		if (veto.pres && veto.chan) {
			console.log('veto');
			message.channel.send('Veto successful. Chosen policy ignored.');
			electionTracker += 1;
			if (electionTracker >= 3) {
				mainChannel.send(embeds.electionTrackerEmbed(deck[0]));
				electionTracker = 0;
				if (deck[0] == 0) {
					libPasses += 1;
				} else {
					fasPasses += 1;
				}
				deck.shift();
				refillDeck();
				termLimits = { pres: "", chan: "" };
			}

			nextRound();
		} else {
			console.log('chan ended with ' + choices);
			message.channel.send(embeds.thanksEmbed());
			if (choices[0] == 0) {
				libPasses += 1;
			} else {
				fasPasses += 1;
			}
		}
		electionTracker = 0;
		specialEvent(pres);
	});
}

function specialEvent(pres) {

	refillDeck();

	switch (playerCount) {
		case 1: // 5-6 Players
			if (libPasses == 5) {
				liberalsWin();
			} else {
				if (fasPasses > specialEventsUsed) {
					switch (fasPasses) {
						case 3:
							policyPeek(pres);
							break;
						case 4:
							killPlayer(pres);
							break;
						case 5:
							mainChannel.send(embeds.vetoPowerEmbed());
							killPlayer(pres);
						case 6:
							fascistsWin();
							break;
					}
					specialEventsUsed++;
				} else {
					nextRound();
					console.log('no special event');
				}
			}
			break;
		case 2:
			if (libPasses == 5) {
				liberalsWin();
			} else {
				if (fasPasses > specialEventsUsed) {
					switch (fasPasses) {
						case 2:
							investigation(pres)
							break;
						case 3:
							specialElection(pres);
							break;
						case 4:
							killPlayer(pres);
							break;
						case 5:
							mainChannel.send(embeds.vetoPowerEmbed());
							killPlayer(pres);
							break;
						case 6:
							fascistsWin();
							break;
					}
					specialEventsUsed++;
				} else {
					nextRound();
					console.log('no special event');
				}
			}
			break;
		case 3:
			if (libPasses == 5) {
				liberalsWin();
			} else {
				if (fasPasses > specialEventsUsed) {
					switch (fasPasses) {
						case 1:
							investigation(pres)
							break;
						case 2:
							investigation(pres)
							break;
						case 3:
							specialElection(pres);
							break;
						case 4:
							killPlayer(pres);
							break;
						case 5:
							mainChannel.send(embeds.vetoPowerEmbed());
							killPlayer(pres);
							break;
						case 6:
							fascistsWin();
							break;
					}
					specialEventsUsed++;
				} else {
					nextRound();
					console.log('no special event');
				}
			};
			break;
		default:
			nextRound();
			break;
	}
}

function policyPeek(pres) {
	nextRound();
	mainChannel.send(embeds.mainPolicyPeekEmbed(pres));
	pres.send(embeds.policyPeekEmbed(deck[0], deck[1], deck[2]));
}

function investigation(pres) {
	gameState = "Investigation";
	mainChannel.send(embeds.mainInvestigationEmbed(pres, players[1].user.username));
}

function specialElection(pres) {
	mainChannel.send(embeds.mainSpecialElectionEmbed(pres));
	gameState = "SpecialElection";
}

function killPlayer(pres) {
	mainChannel.send(embeds.executionEmbed(pres, players[1].user.username));
	gameState = "Execution";
}

function liberalsWin() {
	var list = ""
	players.forEach(function (player, index, array) {
		if (player.role != 0) {
			list += player + ", "
		}
	});
	list = list.slice(0, -2);
	mainChannel.send(embeds.liberalWinEmbed(list));
	gameReset();
}

function fascistsWin() {
	var list = "";
	players.forEach(function (player, index, array) {
		if (player.role == 0) {
			list += player.user.tag + ", "
		}
	});
	list = list.slice(0, -2);
	mainChannel.send(embeds.fascistWinEmbed(list));
	gameReset();
}

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NzIyNTM5ODU1MzA4OTE0ODM5.XuqpOg.F7axhxJ34O0ZD9ZLIC_bBpbRZOA');