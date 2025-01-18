const fs = require('fs');
const mineflayer = require('mineflayer');
function loadConfig() {
  const data = fs.readFileSync('config.txt', 'utf8').trim().split('\n');
  const giftCommand = data[0];
  const accounts = data.slice(1).map(line => {
    const [username, password] = line.split(', ').map(part => part.split(': ')[1]);
    return { username, password };
  });
  return { giftCommand, accounts };
}

const { giftCommand, accounts } = loadConfig();

const kitSlots = [29, 30, 31, 32, 33, 34, 35, 36];
const extraKitSlots = [16, 15, 12, 13, 20, 21];

function log(message) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  console.log(`\x1b[92m[${hours}:${minutes}]\x1b[0m \x1b[37m${message}\x1b[0m`);
}

function createBot(account) {
  let currentKitIndex = 0;
  let currentExtraKitIndex = 0;
  let isLoggedIn = false;

  const bot = mineflayer.createBot({
    host: 'play.pikanetwork.net',
    port: 25565,
    username: account.username,
    version: '1.18.2'
  });

  bot.once('spawn', () => {
    if (!isLoggedIn) {
      isLoggedIn = true;
      log(`\x1b[1m${account.username}\x1b[0m\x1b[37m is now \x1b[32mOnline!\x1b[0m\x1b[37m`);
      bot.chat(`/login ${account.password}`);

      setTimeout(() => {
        bot.chat('/server opfactions');
      }, 3000);

      setTimeout(() => {
        log('\x1b[93mClaiming Kits\x1b[0m');
        processNextKit(bot);
      }, 13000);
    }
  });

  bot.on('windowOpen', (window) => {
    if (window.title === '{"text":"Kit Menu"}') {
      clickKitSlot(bot);
    } else if (window.title === '{"text":"Extra Kits"}') {
      clickExtraKitSlot(bot);
    } else if (window.title === '{"text":"Select items to send"}') {
      clickAllSlots(bot, window);
    } else if (window.title === '{"text":"Are you sure?"}') {
      bot.clickWindow(11, 0, 0);
    }
  });

  bot.on('windowClose', (window) => {
    if (window.title === '{"text":"Kit Menu"}') {
      currentKitIndex++;
      setTimeout(() => processNextKit(bot), 2000);
    } else if (window.title === '{"text":"Extra Kits"}') {
      currentExtraKitIndex++;
      setTimeout(() => processNextExtraKit(bot), 2000);
    }
  });

  bot.on('error', (err) => {
    log(`Bot \x1b[1m${account.username}\x1b[0m\x1b[37m error: ${err}`);
  });

  bot.on('kicked', (reason) => {
    log(`Bot \x1b[1m${account.username}\x1b[0m\x1b[37m kicked: ${reason}`);
  });

  bot.on('end', () => {
    log(`\x1b[31mBot\x1b[0m \x1b[1m${account.username}\x1b[0m\x1b[31m disconnect\x1b[0m`);
    isLoggedIn = false;
  });

  function processNextKit(bot) {
    if (currentKitIndex < kitSlots.length) {
      startKitProcess(bot);
    } else {
      currentKitIndex = 0;
      setTimeout(() => {
        processNextExtraKit(bot);
      }, 60000);
    }
  }

  function processNextExtraKit(bot) {
    if (currentExtraKitIndex < extraKitSlots.length) {
      startKitProcess(bot);
    } else {
      setTimeout(() => sendGiftCommand(bot), 5000);
    }
  }

  function clickKitSlot(bot) {
    const slot = kitSlots[currentKitIndex];
    bot.clickWindow(slot, 0, 0);
  }

  function clickExtraKitSlot(bot) {
    const slot = extraKitSlots[currentExtraKitIndex];
    bot.clickWindow(slot, 0, 0);
  }

  return bot;
}

function startKitProcess(bot) {
  bot.chat('/kit');
}

function clickAllSlots(bot, window) {
  for (let slot = 27; slot <= 62; slot++) {
    try {
      bot.clickWindow(slot, 0, 0);
    } catch (error) {
      log(`Error clicking ${slot}: ${error.message}`);
    }
  }
  
bot.closeWindow(window);
}

function sendGiftCommand(bot) {
   bot.chat(giftCommand);

   setTimeout(() => {
     log(`\x1b[1m${bot.username}\x1b[0m\x1b[93m is now on a cooldown: ${30}min until next kit\x1b[0m`);
     bot.quit();
   },10000);
}

function createBots() {
   accounts.forEach((account,index) => { 
     setTimeout(() => createBot(account), index *35000); 
   });
}

createBots();

setInterval(createBots,1810000);