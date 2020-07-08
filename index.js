const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const moment = require("moment");
const imageapi = require("imageapi.js");

const token = process.argv[2];
const prefix = "gr!";
const pickCooldown = new Set();

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

bot.on("message", async (message) => {
  let version = "0.2.1";
  bot.user.setActivity("gr!help  |  version " + version, {
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
  if (!userData[message.author.id].hasFertiliser)
    userData[message.author.id].hasFertiliser = "false";

  if (message.content.startsWith("<@!727417254337183816>")) {
    await message.reply(
      "My prefix is `" +
        prefix +
        "`.\nYou can use `gr!help` to find a list of commands."
    );
  }

  let args = message.content.toLowerCase().slice(prefix.length).split(" ");
  let argsOriginalCase = message.content.slice(prefix.length).split(" ");

  switch (args[0]) {
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
              .addField("`gr!meme`", "Sends a meme from Imgur.", true)
              .addField(
                "`gr!covidmeme`",
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
                "gr!pick",
                "Pick some grapes! Cooldown: 20 seconds",
                true
              )
              .addField(
                "gr!give <amount> <target>",
                "Send grapes to another user. Aliases: `give`, `send`, `pay`",
                true
              )
              .addField(
                "gr!grapes [user]",
                "Checks your (or another user's) balance. Aliases: `grapes`, `balance`, `bal`, `money`",
                true
              )
              .addField("gr!shop", "Shows the grape shop.", true)
              .addField("gr!buy <item id>", "Buy an item from the shop.", true)
              .addField(
                "gr!inventory [user]",
                "Checks your (or another user's) inventory. Aliases: `inventory`, `inv`, `items`"
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
              .addField("gr!help memes", "Commands for Memes.")
              .addField(
                "gr!help currency",
                "Commands for the Grape Currency System (GCS)."
              )
              .addField("gr!invite", "Invites you to The Grape Vine.")
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
          "Join The Grape Vine for special multipliers and bot support!",
          defaultFooter
        ).addField("Invite Link", "https://discord.gg/mGgM2F3")
      );
      break;
    case "bal":
    case "grapes":
    case "money":
    case "balance":
      if (!args[1]) {
        await message.channel.send(
          embedMessage("Grapes", "", defaultFooter).addField(
            "Grapes",
            userData[message.author.id].money + " :grapes:"
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
            userData[message.mentions.users.first().id].money + " :grapes:"
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
        let grapeVineFooter =
          "**Tip:** Join The Grape Vine to get a 120% multiplier! `gr!invite`";
        if (grapeVine.member(message.author.id)) {
          userData[message.author.id].money += 2;
          grapeVineMessage =
            " As you are in The Grape Vine, you have collected an extra 2 grapes!";
          grapeVineFooter = defaultFooter;
        }
        userData[message.author.id].money += 10;
        await message.channel.send(
          embedMessage(
            "Grape Picking",
            "You have been given 10 :grapes:." + grapeVineMessage,
            grapeVineFooter
          ).addField(
            "New Balance",
            userData[message.author.id].money + " :grapes:",
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
          "Please mention a user to send grapes to. Usage: gr!pay <amount> <mention>"
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
          "Please mention a user to send grapes to. Usage: gr!pay <amount> <mention>"
        );

      if (!userData[payTarget.id]) userData[payTarget.id] = {};
      if (!userData[payTarget.id].money) userData[payTarget.id].money = 0;
      userData[payTarget.id].money += parseInt(args[1]);
      userData[message.author.id].money -= args[1];
      await message.channel.send(
        "Successfully sent " + args[1] + " :grapes: to <@!" + payTarget + ">."
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
          "Get an extra 3 grapes when you do `gr!pick`. Cost: `200 Grapes`. ID: `fertiliser`"
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

        if (!userData[message.mentions.users.first().id].hasFertiliser) {
          userData[message.mentions.users.first().id].hasFertiliser = "false";
        }

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
  }

  fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
    if (err) console.error(err);
  });
});

let userData = JSON.parse(fs.readFileSync("storage/userData.json", "utf8"));

bot.login(token);
