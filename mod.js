if (!cc) throw "Can't find CrossCode...";

class Mira {
  constructor() {
    document.body.addEventListener("modsLoaded", () => this._init());
  }

  _init() {
    this._addPartyMember();
    this._addDatabaseEntries();
    this._loadHeads();
  }

  _addPartyMember() {
    /*
     * The idea here is to add a new entry to the list of party members,
     * and then call the functions that reference that list to reinit the
     * list of data. The way I've implemented this *should* allow for
     * multiple concurrent new party member mods to exist and work correctly
     * with each other.
     */
    sc.PARTY_OPTIONS.push("Mira");

    cc.sc.party.init();

    const origLoad = cc.ig.gameMain[cc.ig.varNames.gameMainLoadMap];
    cc.ig.gameMain[cc.ig.varNames.gameMainLoadMap] = data => {
      const callOrig = origLoad.call(cc.ig.gameMain, data);
      callOrig;

      if (
        cc.sc.party.contacts.Mira.status != undefined &&
        cc.sc.party.contacts.Mira.status == 0
      ) {
        new cc.ig.events.SET_PARTY_MEMBER_SP_LEVEL({
          member: "Mira",
          level: "3"
        }).start();
        new cc.ig.events.SET_PARTY_MEMBER_LEVEL({
          member: "Mira",
          level: 60,
          exp: 183,
          updateEquipment: true
        }).start();
        new cc.ig.events.SET_PARTY_MEMBER_ALL_ELEMENTS({
          member: "Mira",
          allElements: true
        }).start();
        new cc.ig.events.SET_CONTACT_TYPE({
          member: "Mira",
          status: "FRIEND"
        }).start();
      }
    };
  }

  _addDatabaseEntries() {
    simplify.resources
      .loadJSONPatched("data/mira-events.json")
      .then(newDbEntries => {
        cc.ig.Database.data.commonEvents["cooldown-S"].condition =
          "party.alive.Emile || party.alive.Glasses || party.alive.Apollo || party.alive.Joern";
        cc.ig.Database.data.commonEvents["cooldown-A"].condition =
          "party.alive.Emile || party.alive.Glasses || party.alive.Apollo || party.alive.Joern";
        cc.ig.Database.data.commonEvents["cooldown-B"].condition =
          "party.alive.Emile || party.alive.Glasses || party.alive.Apollo || party.alive.Joern";

        for (var key in newDbEntries) {
          cc.ig.Database.data.commonEvents[key] = newDbEntries[key];
        }

        const nobody = cc.ig.Database.data.commonEvents["nobody-contact"];
        delete cc.ig.Database.data.commonEvents["nobody-contact"];
        cc.ig.Database.data.commonEvents["nobody-contact"] = nobody;

        sc.commonEvents.eventsByType = {};
        sc.commonEvents.init();
      })
      .catch(err => {
        throw err;
      });
  }

  _loadHeads() {
    this._tmpHeadsImage = new ig.Image("assets/media/gui/severed-heads.png");
    setTimeout( () => this._updateHeads(), 100 );
  }

  _updateHeads() {
    if (this._tmpHeadsImage.loaded) {
      const tmpSaveGui = new sc.SaveSlotParty;
      Object.assign(tmpSaveGui.headsGfx, this._tmpHeadsImage);
    } else {
      setTimeout( () => this._updateHeads(), 100 );
    }
  };
}

new Mira();

function init() {
  function b(a) {
    for (var b = h.length, c = 0; b--;)
      if (a.time >= h[b]) {
        c = b + 1;
        break
      } return c = Math.min(a.maxLevel, c)
  }
  Vec2.create();
    var d = {
            actionKey: "ATTACK_SPECIAL"
        },
        c = {
            actionKey: "THROW_SPECIAL"
        },
        e = {
            actionKey: "GUARD_SPECIAL"
        },
        f = {
            actionKey: "DASH_SPECIAL"
        },
        g = ["Neutral", "Heat", "Cold", "Shock", "Wave"],
        h = [0.25, 0.5, 1];
    sc.PLAYER_ZOOM = 1;
    var i = {
            thrown: false,
            melee: false,
            aim: false,
            autoThrow: false,
            attack: false,
            guard: false,
            charge: false,
            dashX: 0,
            dashY: 0,
            switchMode: false,
            relativeVel: 0,
            moveDir: Vec2.create()
        },
        j = {};
  ig.ENTITY.Player.inject({
    startCharge: function(a) {
      if (this.animSheet && this.animSheet.path === 'npc.mira') {
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
      if (this.animSheet && this.animSheet.path === 'npc.mira' && this.lockTimer > 0) {
        this.lockTimer = this.lockTimer - ig.system.tick;
        if (this.lockTimer <= 0 && this.lockTimer !== -1) {
          this.target = null;
        }
      }
      this.parent();
      if (this.animSheet && this.animSheet.path === 'npc.mira') {
        this.target = !this.target || this.target._killed ? null : this.target;
      } else if (this.target) {
        this.target = null;
      }
    },
    startCharge: function(a) {
        if (!this.model.getCore(sc.PLAYER_CORE.SPECIAL) || !this.model.getCore(sc.PLAYER_CORE.CLOSE_COMBAT) && a == d) return false;
        var b = this.getMaxChargeLevel(a),
            e = this.model.params.getSp(),
            f = 0;
        e >= sc.PLAYER_SP_COST[2] ? f = 3 : e >= sc.PLAYER_SP_COST[1] ? f = 2 : e >= sc.PLAYER_SP_COST[0] && (f = 1);
        b = Math.min(b, f);
        if (f == 0) {
            if (!this.charging.msg || this.charging.msg.isFinished()) {
                f = ig.lang.get("sc.gui.combat.no-sp");
                this.charging.msg = new sc.SmallEntityBox(this, f, 0.5);
                ig.gui.addGuiElement(this.charging.msg)
            }
        } else {
            this.charging.msg && !this.charging.msg.isFinished() && this.charging.msg.remove();
            this.charging.msg = null
        }
        if (b == 0) return false;
        this.charging.maxLevel = b;
        this.charging.type = a;
        Vec2.assignC(this.charging.prefDir, 0, 0);
        a == c ? this.quickStateSwitch(1) : a == d && this.quickStateSwitch(3);
        return true
    },
    doPlayerAction: function(b) {
        var a = sc.PLAYER_ACTION[b];
        if (!a) throw Error("Unknown Action Type: " + b);
        a = this.model.getAction(a);
        this.playerTrack.startedAction =
            b;
        this.playerTrack.trackTimer = 0.05;
        this.setAction(a)
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
}

document.body.addEventListener('modsLoaded', init);