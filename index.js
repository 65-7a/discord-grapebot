const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const moment = require("moment");

const token = process.argv[2];
const prefix = "grape!";

bot.on("ready", () => {
  console.log("Logged in.");
});

bot.on("message", (message) => {
  let version = "0.1";
  let args = message.content.toLowerCase().slice(prefix.length).split(" ");
  let argsOriginalCase = message.content.slice(prefix.length).split(" ");
  bot.user.setActivity("grape!help  |  v" + version, {
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
  if (!userData[message.author.id].lastDaily)
    userData[message.author.id].lastDaily = "Not Collected";
  if (!userData[message.author.id].lastWeelky)
    userData[message.author.id].lastWeekly = "Not Collected";

  if (message.content.startsWith("<@!727417254337183816")) {
    message.reply(
      "My prefix is `" +
        prefix +
        "`.\nYou can use `+help` to find the commands."
    );
  }

  if (!message.content.startsWith(prefix)) {
    return;
  }

  switch (args[0]) {
    case "help":
      switch (args[1]) {
        case "memes":
          message.channel.send(
            embedMessage(
              "Meme Commands",
              "Meme commands for Grape",
              defaultFooter
            )
              .setAuthor(
                message.author.username,
                message.author.avatarURL(message.author.id)
              )
              .addField("`grape!meme`", "Sends a meme from Imgur.")
              .addField(
                "`grape!covidmeme`",
                "Sends a meme about Coronavirus from Reddit."
              )
          );
          break;
        case "currency":
          message.channel.send(
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
                "grape!daily",
                "Claim your daily reward. Aliases: `daily`"
              )
              .addField(
                "grape!pay <amount> <target>",
                "Sends money to another user. Aliases: `pay`, `givemoney`, `sendmoney`"
              )
              .addField(
                "grape!balance [user]",
                "Checks your balance. Aliases: `balance`, `bal`, `money`"
              )
          );
          break;
        default:
          message.channel.send(
            embedMessage(
              "Grape",
              "Hello! I am Grape, a bot with a currency and dank memes.\n\nTip: `<>` means required, `[]` means optional.",
              defaultFooter
            )
              .setAuthor(
                message.author.username,
                message.author.avatarURL(message.author.id)
              )
              .addField("grape!help memes", "Commands for Memes.")
              .addField(
                "grape!help currency",
                "Commands for the Grape Currency System (GCS)."
              )
          );
          break;
      }
      break;
    case "covidmeme":
      number = 29;
      imageNumber = Math.floor(Math.random() * (number - +1)) + 1;
      message.channel.send(
        embedMessage("From Reddit", "", defaultFooter).setImage(
          "http://callumwong.com/discord-positivebot/covid-memes/" +
            imageNumber +
            "%20.jpg"
        )
      );
      break;
    case "meme":
      number = 996;
      imageNumber = Math.floor(Math.random() * (number - +1)) + 1;
      message.channel.send(
        embedMessage("From Imgur", "", defaultFooter).setImage(
          "http://callumwong.com/discord-positivebot/imgur-memes/" +
            imageNumber +
            "%20.jpg"
        )
      );
      break;
    case "bal":
    case "money":
    case "balance":
      if (!args[1]) {
        message.channel.send(
          embedMessage("Bank", "", defaultFooter).addField(
            "Balance",
            userData[message.author.id].money + " :grapes:"
          )
        );
      } else {
        if (!userData[message.mentions.users.first().id]) userData[message.mentions.users.first().id] = {};
        if (!userData[message.mentions.users.first().id].money)
          userData[message.mentions.users.first().id].money = 0;
        message.channel.send(
          embedMessage(
            message.mentions.users.first().username + "'s Bank",
            "",
            defaultFooter
          ).addField(
            "Balance",
            userData[message.mentions.users.first().id].money + ":grapes:"
          )
        );
      }
      break;
    case "setbal":
      if (message.author.id != "643362491317092372")
        return message.channel.send("Nice try ;)");

      if (!args[1] || isNaN(args[1])) {
        return message.channel.send("Please input a number.");
      }

      let definedUser = "";
      let setbalSuccess = "";
      if (!args[2]) {
        definedUser = message.author.id;
        setbalSuccess =
          "Successfully set your balance to " + args[1] + " :grapes:";
      } else if (message.mentions.members.first()) {
        definedUser = message.mentions.members.first().id;
        if (message.mentions.members.first().user.bot)
          return message.channel.send("Cannot set a bot account's balance!");
        setbalSuccess =
          "Successfully set <@!" +
          message.mentions.users.first().id +
          ">'s balance to " +
          args[1] +
          " :grapes:";
      } else
        return message.channel.send(
          "Please mention a user to set the balance of."
        );

      userData[definedUser].money = parseInt(args[1]);
      message.channel.send(setbalSuccess);

      fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
        if (err) console.error(err);
      });
      break;
    case "daily":
      if (userData[message.author.id].lastDaily != moment().format("L")) {
        userData[message.author.id].lastDaily = moment().format("L");
        userData[message.author.id].money += 50;
        message.channel.send(
          embedMessage(
            "Daily reward",
            "50 :grapes: has been added to your account.",
            defaultFooter
          ).addField(
            "New Balance",
            userData[message.author.id].money + " :grapes:",
            true
          )
        );
      } else {
        message.channel.send(
          embedMessage(
            "Daily Reward",
            "You have already collected your daily reward! Try again " +
              moment().endOf("day").fromNow() +
              ".",
            defaultFooter
          )
        );
      }

      fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
        if (err) console.error(err);
      });
      break;
    case "pay":
    case "sendmoney":
    case "givemoney":
      if (!args[1] | isNaN(args[1]))
        return message.channel.send("Please input a number.");

      if (parseInt(args[1]) > userData[message.author.id].money)
        return message.channel.send("You do not have enough money!");

      let payTarget = "";
      if (!args[2]) {
        return message.channel.send(
          "Please mention a user to send money to. Usage: .pay <amount> <mention>"
        );
      } else if (message.mentions.members.first()) {
        payTarget = message.mentions.members.first().id;
        if (message.mentions.members.first().user.bot)
          return message.channel.send("Cannot pay a bot account!");
        if (payTarget === message.author.id)
          return message.channel.send(
            "Successfully transferred money from one pocket to another."
          );
      } else
        return message.channel.send(
          "Please mention a user to send money to. Usage: .pay <amount> <mention>"
        );

      if (!userData[payTarget.id]) userData[payTarget.id] = {};
      if (!userData[payTarget.id].money)
        userData[payTarget.id].money = 0;
      userData[payTarget.id].money += parseInt(args[1]);
      userData[message.author.id].money -= args[1];
      message.channel.send(
        "Successfully sent " + args[1] + " :grapes: to <@!" + payTarget + ">."
      );

      fs.writeFile("storage/userData.json", JSON.stringify(userData), (err) => {
        if (err) console.error(err);
      });
      break;
  }
});

let userData = JSON.parse(fs.readFileSync("storage/userData.json", "utf8"));

bot.login(token);
