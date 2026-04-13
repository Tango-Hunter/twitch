/**
 * Title: live-alert.js
 * Author: Tango Hunter
 * Date Created: 4/8/26
 * Date Modified: 4/8/26
 */

const username = "Tango_Hunter";

const twitchPlayer = document.getElementById("twitch-player");
twitchPlayer.innerHTML = `<iframe src="https://player.twitch.tv/?channel=${username}&parent=tangohunter.com" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>`;

const terminalText = document.getElementById("terminal-text");

// Fetches and formats uptime or errors if not offline
async function getUptime() {
    try {
        const response = await fetch(`https://decapi.me/twitch/uptime/${username}`);

    // API call returns an HTTP error
    if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

    // Successful API call response
    const data = await response.text();

    // if the API call was successful and user is not offline, formats uptime to remove seconds and makes it easier to read
    if (!data.toLowerCase().includes("offline")) {
        let newUptime = data.replace(/,?\s*\d+\s*seconds?/i, "");
        let hours = (newUptime.match(/(\d+)\s*hour/) || [])[1];
        let minutes = (newUptime.match(/(\d+)\s*minute/) || [])[1];
        let formattedUptime = "Live for ";
        if (hours) formattedUptime += hours + "h ";
        if (minutes) formattedUptime += minutes + "m";
        formattedUptime = formattedUptime.trim();
        return formattedUptime;
    } else {

    // API call returns a falsy value or an empty one
    if (!data || data.trim() === "") {
            throw new Error("Empty response");
        }

    return data; //Returns offline if no errors or uptime
    }
        
    // Error Handler
    } catch (error) {
        console.error("Error fetching uptime:", error);
    return "Error";
    }
}

// Helper functions to return additional Twitch Statistics
async function getGame() {
    const response = await fetch(`https://decapi.me/twitch/game/${username}`);
    return await response.text();
}
async function getViewers() {
    const response = await fetch(`https://decapi.me/twitch/viewercount/${username}`);
    return await response.text();
}
async function getTitle() {
    const response = await fetch(`https://decapi.me/twitch/title/${username}`);
    return await response.text();
}

// Function to type each character in the terminal window
let lineIndex = 0;
let charIndex = 0;
function typeLine(lines) {
  if (lineIndex < lines.length) {
    if (charIndex < lines[lineIndex].length) {
      terminalText.textContent += lines[lineIndex].charAt(charIndex);
      charIndex++;
      setTimeout(() => {
        typeLine(lines);
      }, 35);
    } else {
      terminalText.textContent += "\n";
      lineIndex++;
      charIndex = 0;
      setTimeout(() => {
        typeLine(lines);
      }, 400);
    }
  }
}

// Main function to display in the terminal window
async function main() {
  terminalText.innerText = "";
  lineIndex = 0;
  charIndex = 0;
  const currentUptime = await getUptime();

  if (currentUptime.toLowerCase().includes("offline")) { // Offline
    const currentGame = await getGame();
    const offline = [
      `${username} is offline`,
      `Previous stream content: ${currentGame}`,
      "Please follow on Twitch to receive live alerts"
    ];
    typeLine(offline);

  } else if (currentUptime == "Error") { //Error
    const errorMessage = [
      "Error...",
      "Unable to retrieve stream status",
      "Please check connection"
    ];
    typeLine(errorMessage);

  } else {  // Online
    const currentGame = await getGame();
    const currentViewers = await getViewers();
    const currentTitle = await getTitle();
    const online = [
      `Initializing ${username} stream environment...`,
      "Loading modules: chill, fps, horror, fantasy...",
      `Currently streaming: ${currentGame}`,
      `Current viewers: ${currentViewers}`,
      `Current uptime: ${currentUptime}`,
      `Stream Title: ${currentTitle}`,
      "Status: Ready. Press play and let the chaos begin!"
    ];
    typeLine(online);
  }
}

main();
setInterval(main,60000);
