export class HarvestablesDrawing extends DrawingUtils {
  constructor(Settings) {
    super(Settings);
  }

  interpolate(harvestables, lpX, lpY, t) {
    for (const harvestableOne of harvestables) {
      const hX = -1 * harvestableOne.posX + lpX;
      const hY = harvestableOne.posY - lpY;

      if (harvestableOne.hY == 0 && harvestableOne.hX == 0) {
        harvestableOne.hX = hX;
        harvestableOne.hY = hY;
      }

      harvestableOne.hX = this.lerp(harvestableOne.hX, hX, t);
      harvestableOne.hY = this.lerp(harvestableOne.hY, hY, t);
    }
  }

  invalidate(ctx, harvestables) {
    for (const harv of harvestables) {
      if (harv.size <= 0) continue;

      // OLD, to keep if I do an advance settings menu
      // This will be the beginner friendly

      /*if (!this.settings.harvestingTiers[harv.tier - 1]) {
                continue;
            }

            if (!this.settings.harvestingEnchants[harv.charges]) {
                continue;
            }*/

      const type = harv.type;

      let draw = undefined;

      if (type >= 11 && type <= 14) {
        draw = "fiber_" + harv.tier + "_" + harv.charges;
      } else if (type >= 0 && type <= 5) {
        draw = "Logs_" + harv.tier + "_" + harv.charges;
      } else if (type >= 6 && type <= 10) {
        draw = "rock_" + harv.tier + "_" + harv.charges;
      } else if (type >= 15 && type <= 22) {
        draw = "hide_" + harv.tier + "_" + harv.charges;
      } else if (type >= 23 && type <= 27) {
        draw = "ore_" + harv.tier + "_" + harv.charges;
      }

      if (draw === undefined) continue;

      /*if (this.settings.harvestingFiber && (type >= 11 && type <= 14)) {

                draw = "fiber_" + harv.tier + "_" + harv.charges;
            }
            else if (this.settings.harvestingWood && (type >= 0 && type <= 5)) {

                draw = "Logs_" + harv.tier + "_" + harv.charges;
            }

            else if (this.settings.harvestingRock && (type >= 6 && type <= 10)) {

                draw = "rock_" + harv.tier + "_" + harv.charges;
            }
            
            else if (this.settings.harvestingHide && (type >= 15 && type <= 22))
            {

                draw = "hide_" + harv.tier + "_" + harv.charges;
            }
            else if (this.settings.harvestingOre && (type >= 23 && type <= 27)){

                draw = "ore_" + harv.tier + "_" + harv.charges;
            }*/

      const point = this.transformPoint(harv.hX, harv.hY);

      // TODO
      // Change Resources to Animals/LHarvestables (living harvestables)
      this.DrawCustomImage(ctx, point.x, point.y, draw, "Resources", 50);

      if (this.settings.livingResourcesID)
          this.drawText(point.x, point.y + 20, harv.id.toString(), ctx);

      // TODO
      if (this.settings.resourceSize)
        this.drawText(point.x, point.y - 20, harv.size, ctx);
    }
  }
}
