const Discord = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const imageapi = require("imageapi.js");
const randomWords = require("random-words");
const mathjs = require("mathjs");
const wikifakt = require("wikifakt");
const request = require("request")
const config = require("./storage/config.json");
const bot = new Discord.Client();

const prefix = config.prefix;
const version = config.version;
const pickCooldown = new Set();
const workCooldown = new Set();

bot.on("ready", () => {
  console.log("Logged in.");
});

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%d seconds",
    ss: "%d seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    w: "a week",
    ww: "%d weeks",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

String.prototype.shuffle = function () {
  var a = this.split(""),
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join("");
}

bot.on("message", async (message) => {
  bot.user.setActivity(prefix + "help  |  v" + version, {
    url: "http://callumwong.com",
    type: "WATCHING",
  });

  const embedMessage = (title, description, footer) => {
    const template = new Discord.MessageEmbed()
      .setColor("#a58adf")
      .setTitle(title)
      .setDescription(description)
      .setTimestamp()
      .setFooter(footer, "http://callumwong.com/discord-grapebot/icon.png");
    return template;
  };

  const defaultFooter = "Grape Bot";

  let userData = JSON.parse(fs.readFileSync("storage/userData.json", "utf8"));

  if (!userData[message.author.id]) userData[message.author.id] = {};
  if (!userData[message.author.id].money) userData[message.author.id].money = 0;
  if (!userData[message.author.id].lastPicked)
    userData[message.author.id].lastPicked = "";
  if (!userData[message.author.id].lastWorked)
    userData[message.author.id].lastWorked = "";
  if (!userData[message.author.id].hasFertiliser)
    userData[message.author.id].hasFertiliser = "false";

  if (message.content.startsWith("<@!" + config.id + ">")) {
    await message.reply(
      "My prefix is `" +
      prefix +
      "`.\nYou can use `" +
      prefix +
      "help` to find a list of commands."
    );
  }

  if (!message.content.startsWith(prefix)) return;

  let args = message.content.toLowerCase().slice(prefix.length).split(" ");
  let argsOriginalCase = message.content.slice(prefix.length).split(" ");

  let random = Math.random;

  function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  switch (args[0]) {
    case "grape":
      await message.channel.send("", { files: ["http://callumwong.com/discord-grapebot/icon.png"] });
      break;
    case "help":
      switch (args[1]) {
        case "memes":
          await message.channel.send(
            embedMessage(
              "Meme Commands",
              "Meme commands for Grape",
              defaultFooter
            )
              .setAuthor(
                message.author.username,
                message.author.avatarURL(message.author.id)
              )
              .addField(prefix + "meme", "Sends a meme from Imgur.", true)
              .addField(
                prefix + "covidmeme",
                "Sends a meme about Coronavirus from Reddit.",
                true
              )
          );
          break;
        case "currency":
          await message.channel.send(
            embedMessage(
              "Currency Commands",
              "Currency commands for Grape",
              defaultFooter
            )
              .setAuthor(
                message.author.username,
                message.author.avatarURL(message.author.id)
              )
              .addField(
                prefix + "pick",
                "Pick some grapes! Cooldown: 20 seconds",
                true
              )
              .addField(
                prefix + "give <amount> <target>",
                "Send grapes to another user. Aliases: `give`, `send`, `pay`",
                true
              )
              .addField(
                prefix + "grapes [user]",
                "Checks your (or another user's) balance. Aliases: `grapes`, `balance`, `bal`, `money`",
                true
              )
              .addField(prefix + "shop", "Shows the grape shop.", true)
              .addField(
                prefix + "buy <item id>",
                "Buy an item from the shop.",
                true
              )
              .addField(
                prefix + "inventory [user]",
                "Checks your (or another user's) inventory. Aliases: `inventory`, `inv`, `items`"
              )
              .addField(
                prefix + "work", "Play a minigame to earn grapes! Cooldown: 20 minutes"
              )
          );
          break;
        default:
          await message.channel.send(
            embedMessage(
              "Grape",
              "Hello! I am Grape, a bot with a currency and dank memes.\n\nTip: `<>` means required, `[]` means optional.",
              defaultFooter
            )
              .setAuthor(
                message.author.username,
                message.author.avatarURL(message.author.id)
              )
              .addField(prefix + "help memes", "Commands for Memes.")
              .addField(
                prefix + "help currency",
                "Commands for the Grape currency system."
              )
              .addField(prefix + "invite", "Invites you to The Grape Vine.")
          );
          break;
      }
      break;
    case "covidmeme":
      let covidMemeImg = await imageapi("coronavirusmemes", true);
      await message.channel.send(
        embedMessage("From r/coronavirusmemes", "", defaultFooter)
          .setImage(covidMemeImg)
          .setURL("https://reddit.com/r/coronavirusmemes")
      );
      break;
    case "meme":
      let memeImg = await imageapi("memes", true);
      await message.channel.send(
        embedMessage("From r/memes", "", defaultFooter)
          .setImage(memeImg)
          .setURL("https://reddit.com/r/memes")
      );
      break;
    case "invite":
      await message.author.send(
        embedMessage(
          "The Grape Vine",
          "<:grape:727825674064363622> Join The Grape Vine for special multipliers and bot support! <:grape:727825674064363622>",
          defaultFooter
        ).addField("Invite Link", "https://discord.gg/mGgM2F3")
      );
      break;
    case "fact":
      await message.channel.send(embedMessage("Loading", "Grabbing your random fact...", defaultFooter)).then((msg) => {
        wikifakt.getRandomFact().then(function (fact) {
          msg.edit(embedMessage("Random Fact", fact, defaultFooter));
        });
      })
      break;
    case "bal":
    case "grapes":
    case "money":
    case "balance":
      if (!args[1]) {
        await message.channel.send(
          embedMessage("Your Grapes", "", defaultFooter).addField(
            "Grapes",
            userData[message.author.id].money + " <:grape:727825674064363622>"
          )
        );
      } else {
        if (!message.mentions.users.first()) {
          return message.channel.send("Please enter a valid user!");
        }
        if (!userData[message.mentions.users.first().id])
          userData[message.mentions.users.first().id] = {};
        if (!userData[message.mentions.users.first().id].money)
          userData[message.mentions.users.first().id].money = 0;
        await message.channel.send(
          embedMessage(
            message.mentions.users.first().username + "'s Grapes",
            "",
            defaultFooter
          ).addField(
            "Grapes",
            userData[message.mentions.users.first().id].money + " <:grape:727825674064363622>"
          )
        );
      }
      break;
    case "pick":
      if (pickCooldown.has(message.author.id)) {
        await message.channel.send(
          embedMessage(
            "Grape Picking",
            "This command has a cooldown of 20 seconds!",
            defaultFooter
          ).addField(
            "Message",
            "You to rest before you pick more grapes. Try again " +
            moment(userData[message.author.id].lastPicked)
              .add(20, "seconds")
              .fromNow() +
            "."
          )
        );
      } else {
        userData[message.author.id].lastPicked = moment().format();
        let grapeVine = bot.guilds.resolve("727823777790165035");
        let grapeVineMessage = "";
        let fertiliserMessage = "";
        let extraFooter = "";

        // Checking if the user has bonuses available
        if (!grapeVine.member(message.author.id) && userData[message.author.id].hasFertiliser == "false") {
          if (random() <= 0.5) extraFooter = "Tip: Join The Grape Vine to get an extra 2 grapes! " + prefix + "invite";
          if (random() > 0.5) extraFooter = "Tip: Check out the shop for bonuses when picking grapes! " + prefix + "shop";
        } else if (!grapeVine.member(message.author.id)) {
          extraFooter = "Tip: Join The Grape Vine to get an extra 2 grapes! " + prefix + "invite";
        } else if (userData[message.author.id].hasFertiliser == "false") {
          extraFooter = "Tip: Check out the shop for bonuses when picking grapes! " + prefix + "shop";
        } else {
          extraFooter = defaultFooter;
        }

        // If user is in The Grape Vine
        if (grapeVine.member(message.author.id)) {
          userData[message.author.id].money += 2;
          grapeVineMessage =
            " As you are in The Grape Vine, you have collected an extra 2<:grape:727825674064363622>!";
        }

        // If user has fertiliser
        if (userData[message.author.id].hasFertiliser == "true") {
          userData[message.author.id].money += 3;
          fertiliserMessage = " Your fertiliser has also grown you an extra 3<:grape:727825674064363622>!"
        }

        userData[message.author.id].money += 5;
        await message.channel.send(
          embedMessage(
            "Grape Picking",
            "You have been given 10<:grape:727825674064363622>." + grapeVineMessage + fertiliserMessage,
            extraFooter
          ).addField(
            "New Balance",
            userData[message.author.id].money + " <:grape:727825674064363622>",
            true
          )
        );
        pickCooldown.add(message.author.id);
        setTimeout(() => {
          pickCooldown.delete(message.author.id);
        }, 20000);
      }
      break;
    case "pay":
    case "send":
    case "give":
      if (!args[1] | isNaN(args[1]))
        return message.channel.send("Please input a number.");

      if (parseInt(args[1]) > userData[message.author.id].money)
        return message.channel.send("You do not have enough grapes!");

      if (!message.mentions.users.first()) {
        return message.channel.send("Please enter a valid user!");
      }

      let payTarget = "";
      if (!args[2]) {
        return message.channel.send(
          "Please mention a user to send grapes to. Usage: " + prefix + "pay <amount> <mention>"
        );
      } else if (message.mentions.users.first()) {
        payTarget = message.mentions.users.first().id;
        if (message.mentions.users.first().user.bot)
          return message.channel.send("Cannot pay a bot account!");
        if (payTarget === message.author.id)
          return message.channel.send(
            "Successfully transferred grapes from one pocket to another."
          );
      } else
        return message.channel.send(
          "Please mention a user to send grapes to. Usage: " + prefix + "pay <amount> <mention>"
        );

      if (!userData[payTarget.id]) userData[payTarget.id] = {};
      if (!userData[payTarget.id].money) userData[payTarget.id].money = 0;
      userData[payTarget.id].money += parseInt(args[1]);
      userData[message.author.id].money -= args[1];
      await message.channel.send(
        "Successfully sent " + args[1] + " <:grape:727825674064363622> to <@!" + payTarget + ">."
      );
      break;
    case "shop":
      await message.channel.send(
        embedMessage(
          "Grape Shop",
          "Buy items with grapes!",
          defaultFooter
        ).addField(
          "Fertiliser",
          "Get an extra 3 grapes when you do `" + prefix + "pick`. Cost: `200 Grapes`. ID: `fertiliser`"
        )
      );
      break;
    case "buy":
      if (!args[1]) {
        return message.channel.send("You need to specify something to buy.");
      }

      switch (args[1]) {
        case "fertiliser":
          if (userData[message.author.id].hasFertiliser == "true") {
            return message.channel.send(
              "The maximum count that you can have of this item is: 1"
            );
          }
          if (200 > userData[message.author.id].money) {
            return message.channel.send("You do not have enough grapes!");
          }
          userData[message.author.id].hasFertiliser = "true";
          userData[message.author.id].money -= 200;

          await message.channel.send(
            "Successfully bought item with ID: `fertiliser`."
          );
          break;
        default:
          await message.channel.send("Please enter a valid item ID.");
      }
      break;
    case "items":
    case "inv":
    case "inventory":
      if (!args[1]) {
        if (!userData[message.author.id].hasFertiliser) {
          userData[message.author.id].hasFertiliser = "false";
        }

        if (userData[message.author.id].hasFertiliser == "true") {
          await message.channel.send(
            embedMessage(
              message.author.username + "'s Inventory",
              "",
              defaultFooter
            ).addField("Fertiliser (x1)", "ID: `fertiliser`")
          );
        } else {
          await message.channel.send(
            embedMessage(
              message.author.username + "'s Inventory",
              "No items in inventory!",
              defaultFooter
            )
          );
        }
      } else {
        if (!message.mentions.users.first()) {
          return message.channel.send("Please enter a valid user!");
        }

        if (!userData[message.mentions.users.first().id].money) userData[message.mentions.users.first().id].money = 0;
        if (!userData[message.mentions.users.first().id].hasFertiliser) userData[message.mentions.users.first().id].hasFertiliser = "false";

        if (userData[message.mentions.users.first().id].hasFertiliser == "true") {
          await message.channel.send(
            embedMessage(
              message.mentions.users.first().username + "'s Inventory",
              "",
              defaultFooter
            ).addField("Fertiliser (x1)", "ID: `fertiliser`")
          );
        } else {
          await message.channel.send(
            embedMessage(
              message.mentions.users.first().username + "'s Inventory",
              "No items in inventory!",
              defaultFooter
            )
          );
        }
      }
      break;
    case "work":
      if (workCooldown.has(message.author.id)) {
        await message.channel.send(
          embedMessage(
            "Work",
            "This command has a cooldown of 20 minutes!",
            defaultFooter
          ).addField(
            "Message",
            "You to rest before you work again. Try again " +
            moment(userData[message.author.id].lastWorked)
              .add(20, "minutes")
              .fromNow() +
            "."
          )
        );
      } else {
        userData[message.author.id].lastWorked = moment().format();
        if (random() <= 0.25) {
          var randomWord = randomWords();
          let correct = false;
          const collected = m => m.content.includes(randomWord);
          await message.channel.send("The next message will be scrambled. Unscramble the word in 20 seconds to gain 100 grapes!");
          await message.channel.send("`" + randomWord.shuffle() + "`");
          const collector = message.channel.createMessageCollector(collected, { time: 20000 });
          collector.on('collect', m => {
            message.reply("You are correct! 100<:grape:727825674064363622>has been added to your account.");
            userData[message.author.id].money += 100;
            correct = true;
            collector.stop("");
            fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
              if (err) console.error(err);
            });
          });
          collector.on('end', ended => {
            if (correct == false) message.reply("You did not guess the word in time! The word was `" + randomWord + "`.");
            fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
              if (err) console.error(err);
            });
          });
        } else if (random() <= 0.50) {
          var TreeNode = function (left, right, operator) {
            this.left = left;
            this.right = right;
            this.operator = operator;

            this.toString = function () {
              return '(' + left + ' ' + operator + ' ' + right + ')';
            }
          }

          function randomNumberRange(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
          }

          var operators = ['*', '-', '+'];

          function buildTree(numNodes) {
            if (numNodes === 1)
              return randomNumberRange(1, 50);

            var numLeft = Math.floor(numNodes / 2);
            var leftSubTree = buildTree(numLeft);
            var numRight = Math.ceil(numNodes / 2);
            var rightSubTree = buildTree(numRight);

            var num = randomNumberRange(0, operators.length);
            var str = operators[num];
            return new TreeNode(leftSubTree, rightSubTree, str);
          }

          var randomQuestion = buildTree(3).toString();
          var answer = mathjs.compile(randomQuestion);
          let correct = false;
          const collected = m => m.content.includes(answer.evaluate());
          await message.channel.send("The next message will be a maths equation. Solve the equation in 20 seconds to gain 100 grapes!");
          await message.channel.send("`" + randomQuestion + "`");
          const collector = message.channel.createMessageCollector(collected, { time: 20000 });
          collector.on('collect', m => {
            message.reply("You are correct! 100<:grape:727825674064363622>has been added to your account.");
            userData[message.author.id].money += 100;
            correct = true;
            collector.stop("");
            fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
              if (err) console.error(err);
            });
          });
          collector.on('end', ended => {
            if (correct == false) message.reply("You did not solve the equation in time! The answer was `" + answer.evaluate() + "`.");
            fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
              if (err) console.error(err);
            });
          });
        } else if (random() <= 0.75) {
          request({
            url: "https://opentdb.com/api.php?amount=1&category=15&difficulty=medium&type=multiple",
            json: true
          }, async function (error, response, body) {
            if (!error && response.statusCode === 200) {
              var answers = [body.results[0].correct_answer].concat(body.results[0].incorrect_answers);
              shuffleArray(answers);
              var desc = body.results[0].question + "\n\n__Answers__:\n";
              var correctAnswer = 0;
              for (i = 0; i < answers.length; i++) {
                if (answers[i] == body.results[0].correct_answer) correctAnswer = i + 1;
                desc = desc.concat((i + 1) + ") " + answers[i] + "\n").replace("&quot;", "\"").replace("&#039;", "'").replace("&eacute;", "é");
              }

              await message.channel.send("The next message will be a quiz about Video Games. React correctly in 20 seconds to gain 100 grapes!");
              await message.channel.send(embedMessage(body.results[0].category, desc, defaultFooter)).then(async function (msg) {
                await msg.react('1️⃣');
                await msg.react('2️⃣');
                await msg.react('3️⃣');
                await msg.react('4️⃣');
                const filter = (reaction, user) => {
                  return reaction.emoji.name == '1️⃣' || reaction.emoji.name == '2️⃣' || reaction.emoji.name == '3️⃣' || reaction.emoji.name == '4️⃣' && user.id === message.author.id;
                };

                const collector = msg.createReactionCollector(filter, { time: 15000 });
                let correct = false;

                collector.on('collect', (reaction, user) => {
                  var response = reaction.emoji.name.replace('1️⃣', "1").replace('2️⃣', "2").replace('3️⃣', "3").replace('4️⃣', "4");
                  if (response != correctAnswer.toString()) {
                    return collector.stop("");
                  }
                  message.reply("You are correct! 100<:grape:727825674064363622>has been added to your account.");
                  userData[message.author.id].money += 100;
                  correct = true;
                  collector.stop("");
                  fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
                    if (err) console.error(err);
                  });
                });

                collector.on('end', collected => {
                  if (!correct) message.reply("That wasn't the correct answer! The correct answer was `" + correctAnswer + "`.");
                  fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
                    if (err) console.error(err);
                  });
                });
              });
            }
          })
        } else {
          request({
            url: "https://opentdb.com/api.php?amount=1&category=12&difficulty=medium&type=multiple",
            json: true
          }, async function (error, response, body) {
            if (!error && response.statusCode === 200) {
              var answers = [body.results[0].correct_answer].concat(body.results[0].incorrect_answers);
              shuffleArray(answers);
              var desc = body.results[0].question + "\n\n__Answers__:\n";
              var correctAnswer = 0;
              for (i = 0; i < answers.length; i++) {
                if (answers[i] == body.results[0].correct_answer) correctAnswer = i + 1;
                desc = desc.concat((i + 1) + ") " + answers[i] + "\n").replace("&quot;", "\"").replace("&#039;", "'").replace("&eacute;", "é");
              }

              await message.channel.send("The next message will be a quiz about Music. React correctly in 20 seconds to gain 100 grapes!");
              await message.channel.send(embedMessage(body.results[0].category, desc, defaultFooter)).then(async function (msg) {
                await msg.react('1️⃣');
                await msg.react('2️⃣');
                await msg.react('3️⃣');
                await msg.react('4️⃣');
                const filter = (reaction, user) => {
                  return reaction.emoji.name == '1️⃣' || reaction.emoji.name == '2️⃣' || reaction.emoji.name == '3️⃣' || reaction.emoji.name == '4️⃣' && user.id === message.author.id;
                };

                const collector = msg.createReactionCollector(filter, { time: 15000 });
                let correct = false;

                collector.on('collect', (reaction, user) => {
                  var response = reaction.emoji.name.replace('1️⃣', "1").replace('2️⃣', "2").replace('3️⃣', "3").replace('4️⃣', "4");
                  if (response != correctAnswer.toString()) {
                    return collector.stop("");
                  }
                  message.reply("You are correct! 100<:grape:727825674064363622>has been added to your account.");
                  userData[message.author.id].money += 100;
                  correct = true;
                  collector.stop("");
                  fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
                    if (err) console.error(err);
                  });
                });

                collector.on('end', collected => {
                  if (!correct) message.reply("That wasn't the correct answer! The correct answer was `" + correctAnswer + "`.");
                  fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
                    if (err) console.error(err);
                  });
                });
              });
            }
          })
        }

        workCooldown.add(message.author.id);
        setTimeout(() => {
          workCooldown.delete(message.author.id);
        }, 1200000);
      }
      break;
    case "admin":
      if (message.author.id != 643362491317092372) return;
      switch (args[1]) {
        case "add":
          if (!args[2] || isNaN(args[2])) return await message.channel.send("Usage: `" + prefix + "admin add <grapes> [user]`");
          if (!args[3]) {
            userData[message.author.id].money += parseInt(args[2]);
            await message.channel.send("Added " + args[2] + "<:grape:727825674064363622>to your account.");
          } else {
            if (!message.mentions.users.first()) return await message.channel.send("Usage: `" + prefix + "admin add <grapes> [user]`");
            if (!userData[message.mentions.users.first().id].money) userData[message.mentions.users.first().id].money = 0;
            userData[message.mentions.users.first().id].money += parseInt(args[2]);
            await message.channel.send("Added " + args[2] + "<:grape:727825674064363622>to " + message.mentions.users.first().username + "'s account.");
          }
          break;
        default:
          message.channel.send("<:grape:727825674064363622> Invalid command!");
      }
      break;
  }

  fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
    if (err) console.error(err);
  });
});

let userData = JSON.parse(fs.readFileSync("storage/userData.json", "utf8"));

bot.login(config.token);
