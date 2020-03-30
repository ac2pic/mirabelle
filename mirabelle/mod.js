sc.PARTY_OPTIONS.push("Mirabelle");


ig.module("game.feature.player.entities.player-hexa").requires("game.feature.player.entities.player").defines(function() {
  sc.PLAYER_ZOOM = 1;
  
  ig.ENTITY.Player.inject({
    startCharge: function(a) {
      if (this.animSheet && this.animSheet.path === 'npc.mirabelle') {
        var art = this.model.getCombatArt(this.model.currentElementMode, `${a.actionKey}1_A`)
        if (art && art.needsTarget) {
          if (!this.target) {
            this.charging.msg = new sc.SmallEntityBox(this, "Target Needed", 0.5);
            ig.gui.addGuiElement(this.charging.msg);
            b = 0;
          } else {
            this.charging.msg && !this.charging.msg.isFinished() && this.charging.msg.remove();
            this.charging.msg = null
          }
        }
      }
      return this.parent(a);
    },
    update: function() {
      if (this.animSheet && this.animSheet.path === 'npc.mirabelle' && this.lockTimer > 0) {
        this.lockTimer = this.lockTimer - ig.system.tick;
        if (this.lockTimer <= 0 && this.lockTimer !== -1) {
          this.target = null;
        }
      }
      this.parent();
      if (this.animSheet && this.animSheet.path === 'npc.mirabelle') {
        this.target = !this.target || this.target._killed ? null : this.target;
      } else if (this.target) {
        this.target = null;
      }
    },
    startCloseCombatAction: function(a, b) {
      if (this.attackCounter > 1 && this.animSheet && this.animSheet.path === 'npc.mira') {
        b.melee = true;
        a = "ATTACK_FINISHER";
        this.attackResetTimer = this.attackCounter = 0;
      }
      this.parent(a, b);
    },
    onTargetHit: function(a, b, c, d) {
      if (this.animSheet && this.animSheet.path === 'npc.mira') {
        this.target = a;
        if (this.lockTimer < 2.0 && this.lockTimer !== -1) {
          this.lockTimer = 2.0;
        }
      }
      this.parent(a, b, c, d);
    }
  });

  ig.ACTION_STEP.FACE_TO_TARGET.inject({
    run: function(a) {
      if (a.isPlayer && !a.tempTarget && a.animSheet && a.animSheet.path === 'npc.mira') {
        return true;
      }
      a.faceToTarget.active = this.value;
      var b = a.getTarget();
      if (this.immediately && b) {
        b = Vec2.sub(b.getCenter(), a.getCenter());
        Vec2.isZero(b) && Vec2.assignC(b, 0, 1);
        a.faceToTarget.offset && Vec2.rotate(b, a.faceToTarget.offset * 2 * Math.PI);
        Vec2.assign(a.face, b)
      }
      return true
    }
  });
});