export class PlayersDrawing extends DrawingUtils {
  constructor(Settings, spellsInfo) {
    super(Settings);

    this.itemsInfo = {};
    this.spellsInfo = spellsInfo;
  }

  updateItemsInfo(newData) {
    this.itemsInfo = newData;
  }

  updateSpellsInfo(newData) {
    this.spellsInfo = newData;
  }

  calculateRemainingCooldown(currentTime, spellEndTime) {
    const currentTimeMs = currentTime.getTime();
    const spellEndTimeMs = spellEndTime.getTime();
    const timeDifference = Math.abs(spellEndTimeMs - currentTimeMs);
    return parseFloat((timeDifference / 1000).toFixed(1));
  }

  sortPlayersByDistance(players) {
    // Sort all players by their distance
    const sortedPlayers = players.slice().sort((a, b) => a.distance - b.distance);

    // Extract the top 3 closest players
    const top3 = sortedPlayers.slice(0, 3);

    // Maintain the original order among the top 3 closest players
    const originalTop3 = players.filter(player => top3.includes(player));

    // Get the rest of the players, excluding the original top 3
    const rest = sortedPlayers.slice(3);

    // Combine the original top 3 with the sorted rest
    return originalTop3.concat(rest);
  }

  drawItems(context, canvas, players, devMode, castedSpells, spellsDev, alreadyFilteredPlayers, filteredGuilds, filteredAlliances) {
    let posY = 15;
    const currentTime = new Date();
    const sortedPlayers = this.sortPlayersByDistance(players);

    if (players.length <= 0) {
      this.settings.ClearPreloadedImages("Items");
      return;
    }

    for (const playerOne of sortedPlayers) {
      const items = playerOne.items;
      const spells = playerOne.spells;
      if (filteredGuilds.find((name) => name === playerOne.guildName.toUpperCase()) || filteredAlliances.find((name) => name === playerOne.alliance.toUpperCase()) || alreadyFilteredPlayers.find((name) => name === playerOne.nickname.toUpperCase()))
        continue;
      if (items == null) continue;

      let posX = 5;
      const total = posY + 20;

      // Show more than few players
      if (total > canvas.height) break; // Exceed canvas size

      const flagId = playerOne.flagId || 0;
      const flagName = FactionFlagInfo[flagId];
      this.DrawCustomImage(context, posX + 10, posY - 5, flagName, "Flags", 20);
      let posTemp = posX + 25;

      const nickname = playerOne.nickname;
      this.drawTextItems(posTemp, posY, nickname, context, "14px", "white");

      posTemp += context.measureText(nickname).width + 10;
      this.drawTextItems(
        posTemp,
        posY,
        playerOne.currentHealth + "/" + playerOne.initialHealth,
        context,
        "14px",
        "red"
      );

      posTemp +=
        context.measureText(
          playerOne.currentHealth + "/" + playerOne.initialHealth
        ).width + 10;

      let itemsListString = "";
      let spellsListString = "";

      posX += 20;
      posY += 25;

      if (items["type"] === "Buffer") {
        // No items
        posX = 0;
        posY += 50;
        continue;
      }

      for (const item of items) {
        const itemInfo = this.itemsInfo[item];

        if (
          itemInfo != undefined &&
          this.settings.GetPreloadedImage(itemInfo, "Items") !== null
        ) {
          this.DrawCustomImage(context, posX, posY, itemInfo, "Items", 40);
        }

        posX += 10 + 40;
        itemsListString += item.toString() + " ";
      }

      if (devMode) {
        this.drawTextItems(
          posTemp,
          posY - 5,
          itemsListString,
          context,
          "14px",
          "white"
        );
      }

      posY += 45;

      if (spells != null) {
        for (const key in spells) {
          if (spells.hasOwnProperty(key)) {
            spellsListString += spells[key] + " ";
          }
        }
        posY += 5;
        if (this.settings.settingSpells) {
          posX = 25;
          const spellKeys = ["weaponFirst", "weaponSecond", "weaponThird", "helmet", "chest", "boots"];
          for (const key of spellKeys) {
            let spellIcon = "";
            if (spells[key] in this.spellsInfo.spellList) {
              spellIcon = this.spellsInfo.spellList[spells[key]].icon;
            } else {
              this.spellsInfo.logMissingSpell(spells[key]);
            }
            if (spellIcon != "" && this.settings.GetPreloadedImage(spellIcon, "Spells") !== null) {
              this.DrawCustomImage(context, posX, posY, spellIcon, "Spells", 50);
            }

            const spellKey = `${playerOne.id}_${spells[key]}`;
            if (spellKey in castedSpells) {
              const remainingTime = this.calculateRemainingCooldown(currentTime, castedSpells[spellKey]);
              this.drawFilledCircle(context, posX, posY, 25, "#00000099");
              this.drawText(posX, posY, remainingTime.toString(), context);
            }

            posX += 50;
          }
        }
        if (spellsDev) {
          this.drawTextItems(posTemp - 140, posY - 15, spellsListString, context, "14px", "white");
        }
        posY += 45;
      }
    }
  }

  interpolate(players, lpX, lpY, t) {
    for (const playerOne of players) {
      const hX = -1 * playerOne.posX + lpX;
      const hY = playerOne.posY - lpY;
      let distance = Math.round(
        Math.sqrt(
          (playerOne.posX - lpX) * (playerOne.posX - lpX) +
          (playerOne.posY - lpY) * (playerOne.posY - lpY)
        )
      );
      playerOne.distance = distance;
      if (playerOne.hY == 0 && playerOne.hX == 0) {
        playerOne.hX = hX;
        playerOne.hY = hY;
      }

      playerOne.hX = this.lerp(playerOne.hX, hX, t);
      playerOne.hY = this.lerp(playerOne.hY, hY, t);
    }
  }

  invalidate(context, players, alreadyFilteredPlayers, filteredGuilds, filteredAlliances) {
    const showFilteredPlayers = this.settings.returnLocalBool("settingDrawFilteredPlayers");
    const showFilteredGuilds = this.settings.returnLocalBool("settingDrawFilteredGuilds");
    const showFilteredAlliances = this.settings.returnLocalBool("settingDrawFilteredAlliances");

    for (const playerOne of players) {
      const point = this.transformPoint(playerOne.hX, playerOne.hY);
      let space = 0;

      if (!showFilteredGuilds && filteredGuilds.find((name) => name === playerOne.guildName.toUpperCase()))
        continue;
      if (!showFilteredAlliances && filteredAlliances.find((name) => name === playerOne.alliance.toUpperCase()))
        continue;
      if (!showFilteredPlayers && alreadyFilteredPlayers.find((name) => name === playerOne.nickname.toUpperCase()))
        continue;

      const flagId = playerOne.flagId || 0;
      const flagName = FactionFlagInfo[flagId];

      // Check if the player is part of filtered guilds/alliances/players
      let isFiltered = false;
      let iconName = '';

      if (filteredGuilds.find((name) => name === playerOne.guildName.toUpperCase())) {
        isFiltered = true;
        iconName = 'guild';
      } else if (filteredAlliances.find((name) => name === playerOne.alliance.toUpperCase())) {
        isFiltered = true;
        iconName = 'alliance';
      } else if (alreadyFilteredPlayers.find((name) => name === playerOne.nickname.toUpperCase())) {
        isFiltered = true;
        iconName = 'player';
      }

      // Draw the status circle for mounted/unmounted status
      if (this.settings.settingMounted) {
        context.beginPath();
        context.arc(point.x, point.y, 11, 0, 2 * Math.PI, false); // Adjust the circle position and radius as needed
        context.strokeStyle = playerOne.mounted ? 'green' : 'red';
        context.lineWidth = 3;
        context.stroke();
      }

      if (isFiltered) {
        // Draw the custom icon for filtered players
        this.DrawCustomImage(context, point.x, point.y, iconName, "Flags", 20); // Adjust the icon position and size as needed
      } else {
        // Draw the status icon for unfiltered players
        this.DrawCustomImage(context, point.x, point.y, flagName, "Flags", 20);
      }

      if (this.settings.settingNickname) {
        space = space + 23;
        this.drawText(point.x, point.y + space, playerOne.nickname, context);
      }
      if (this.settings.settingDistance) {
        this.drawText(point.x, point.y - 14, playerOne.distance + "m", context);
      }

      if (this.settings.settingHealth) {
        space = space + 6;

        const percent = playerOne.currentHealth / playerOne.initialHealth;
        let width = 60;
        let height = 7;

        context.fillStyle = "#121317";
        context.fillRect(
          point.x - width / 2,
          point.y - height / 2 + space,
          width,
          height
        );

        context.fillStyle = "red";
        context.fillRect(
          point.x - width / 2,
          point.y - height / 2 + space,
          width * percent,
          height
        );
      }
      if (this.settings.settingGuild) {
        space = space + 14;

        if (playerOne.guildName != "undefined") {
          this.drawText(point.x, point.y + space, playerOne.guildName, context);
        }
      }
    }
  }
}
