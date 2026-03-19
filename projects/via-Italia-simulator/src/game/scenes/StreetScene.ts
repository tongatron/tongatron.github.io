import Phaser from 'phaser';
import { npcDefinitions, propDefinitions, worldHeight, worldWidth } from '../content/world';
import { gameState } from '../state/gameState';
import { beginDialogue, resolveDialogueChoice } from '../systems/dialogueSystem';
import { advanceQuest } from '../systems/questSystem';
import type { NPCDefinition, PropDefinition } from '../types';
import { getOverlayController } from '../ui/overlay';

type DynamicRectangle = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
};

type StaticRectangle = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.StaticBody;
};

interface SceneNPC {
  definition: NPCDefinition;
  actor: StaticRectangle;
}

interface SceneProp {
  definition: PropDefinition;
  actor: StaticRectangle;
}

export class StreetScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: DynamicRectangle;
  private readonly npcs: SceneNPC[] = [];
  private readonly props: SceneProp[] = [];
  private interactionTarget: SceneNPC | SceneProp | null = null;
  private currentNodeId: string | null = null;
  private dialogueOpen = false;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('street');
  }

  create(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error('Tastiera non disponibile.');
    }

    this.cursors = keyboard.createCursorKeys();
    this.keys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setZoom(1.03);

    this.drawBackdrop();
    this.player = this.createPlayer();
    this.createStreetObstacles();
    this.createNPCs();
    this.createProps();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setFollowOffset(0, 40);

    const overlay = getOverlayController();
    overlay.setPrompt(null);
    overlay.hideDialogue();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      overlay.setPrompt(null);
      overlay.hideDialogue();
    });
  }

  update(): void {
    if (this.dialogueOpen) {
      this.player.body.setVelocity(0, 0);
      return;
    }

    this.updateMovement();
    this.updateInteractionPrompt();

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.interactionTarget) {
      if ('roots' in this.interactionTarget.definition) {
        this.openDialogue(this.interactionTarget.definition);
        return;
      }

      this.useProp(this.interactionTarget.definition);
    }
  }

  private drawBackdrop(): void {
    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 0xf4ead7);
    this.add.rectangle(worldWidth / 2, 450, worldWidth, 360, 0xd9c296);
    this.add.rectangle(worldWidth / 2, 450, worldWidth, 280, 0xe7d7b2);

    const shopPalette = [0xcc6d42, 0x5b7581, 0x8f5a5b, 0x927447, 0x486b50];

    for (let index = 0; index < 8; index += 1) {
      const x = 130 + index * 190;
      const width = 145;

      this.add.rectangle(x, 170, width, 180, 0xf6efe0).setStrokeStyle(2, 0xd1c0a0);
      this.add.rectangle(x, 730, width, 180, 0xf6efe0).setStrokeStyle(2, 0xd1c0a0);
      this.add.rectangle(x, 230, width, 36, shopPalette[index % shopPalette.length]);
      this.add.rectangle(x, 670, width, 36, shopPalette[(index + 2) % shopPalette.length]);
    }

    for (let index = 0; index < 32; index += 1) {
      const x = 50 + index * 48;
      this.add.rectangle(x, 450, 24, 4, 0xcdb27f);
    }

    this.add.text(110, 102, 'Portici, voci, caffe e decisioni non richieste', {
      color: '#6f5a3d',
      fontFamily: 'Georgia',
      fontSize: '24px',
    });

    this.add.text(1210, 108, 'Via Italia', {
      color: '#b44d27',
      fontFamily: 'Georgia',
      fontSize: '34px',
      fontStyle: 'bold',
    });
  }

  private createPlayer(): DynamicRectangle {
    const shadow = this.add.ellipse(220, 495, 34, 12, 0x000000, 0.12);
    const player = this.add.rectangle(220, 470, 34, 48, 0x1f4965) as DynamicRectangle;
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    player.body.setDrag(850, 850);
    player.body.setMaxVelocity(220, 220);
    player.setDepth(10);

    this.add.text(194, 520, 'Tu', {
      color: '#23313b',
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      fontStyle: 'bold',
    }).setDepth(11);

    shadow.setDepth(9);
    return player;
  }

  private createStaticBlock(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    alpha = 1,
  ): StaticRectangle {
    const block = this.add.rectangle(x, y, width, height, color, alpha) as StaticRectangle;
    this.physics.add.existing(block, true);
    this.physics.add.collider(this.player, block);
    return block;
  }

  private createStreetObstacles(): void {
    const planterPositions = [
      { x: 390, y: 450 },
      { x: 1030, y: 450 },
    ];

    planterPositions.forEach(({ x, y }) => {
      this.createStaticBlock(x, y, 64, 64, 0x566e35);
      this.add.circle(x, y - 6, 18, 0x8fba59);
      this.add.circle(x - 18, y + 4, 13, 0x7ea24a);
      this.add.circle(x + 18, y + 6, 13, 0x7ea24a);
    });

    const benchPositions = [
      { x: 575, y: 360 },
      { x: 900, y: 548 },
    ];

    benchPositions.forEach(({ x, y }) => {
      this.createStaticBlock(x, y, 78, 22, 0x7f5c3e);
      this.add.rectangle(x, y - 14, 78, 10, 0x9a7655);
    });
  }

  private createNPCs(): void {
    npcDefinitions.forEach((definition) => {
      this.add.ellipse(definition.x, definition.y + definition.height / 2, 48, 14, 0x000000, 0.12);
      const actor = this.createStaticBlock(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        definition.color,
      );

      actor.setDepth(15);

      this.add.text(definition.x - 70, definition.y - 62, definition.name, {
        color: '#7a2f16',
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        fontStyle: 'bold',
        stroke: '#fff8ef',
        strokeThickness: 5,
      }).setDepth(16);

      this.npcs.push({ definition, actor });
    });
  }

  private createProps(): void {
    propDefinitions.forEach((definition) => {
      const actor = this.createStaticBlock(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        definition.color,
      );

      actor.setDepth(8);
      this.add
        .rectangle(definition.x, definition.y - 18, definition.width - 14, definition.height - 28, 0xf2e7cb)
        .setDepth(9)
        .setStrokeStyle(2, 0xd4c29b);
      this.add.text(definition.x - 28, definition.y - 70, 'Bacheca', {
        color: '#fff8ef',
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        fontStyle: 'bold',
      }).setDepth(10);

      this.props.push({ definition, actor });
    });
  }

  private updateMovement(): void {
    const horizontal =
      Number(this.cursors.right.isDown || this.keys.right.isDown) -
      Number(this.cursors.left.isDown || this.keys.left.isDown);
    const vertical =
      Number(this.cursors.down.isDown || this.keys.down.isDown) -
      Number(this.cursors.up.isDown || this.keys.up.isDown);

    const movement = new Phaser.Math.Vector2(horizontal, vertical).normalize().scale(190);
    this.player.body.setVelocity(movement.x, movement.y);
  }

  private updateInteractionPrompt(): void {
    const overlay = getOverlayController();
    let nearest: SceneNPC | SceneProp | null = null;
    let nearestDistance = 86;

    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.actor.x,
        npc.actor.y,
      );

      if (distance < nearestDistance) {
        nearest = npc;
        nearestDistance = distance;
      }
    }

    for (const prop of this.props) {
      if (!gameState.matchesConditions(prop.definition)) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        prop.actor.x,
        prop.actor.y,
      );

      if (distance < nearestDistance) {
        nearest = prop;
        nearestDistance = distance;
      }
    }

    this.interactionTarget = nearest;

    if (!nearest) {
      overlay.setPrompt(null);
      return;
    }

    overlay.setPrompt(nearest.definition.prompt);
  }

  private openDialogue(npc: NPCDefinition): void {
    const overlay = getOverlayController();
    const dialogue = beginDialogue(npc.roots);

    this.dialogueOpen = true;
    this.currentNodeId = dialogue.nodeId;
    this.player.body.setVelocity(0, 0);
    overlay.setPrompt(null);
    overlay.showDialogue(dialogue, (choiceId) => {
      this.handleDialogueChoice(choiceId);
    });
  }

  private handleDialogueChoice(choiceId: string): void {
    if (!this.currentNodeId) {
      return;
    }

    const overlay = getOverlayController();
    const result = resolveDialogueChoice(this.currentNodeId, choiceId);

    result.notifications.forEach((message) => {
      overlay.pushToast(message);
    });

    if (result.close || !result.nextDialogue) {
      this.closeDialogue();
      return;
    }

    this.currentNodeId = result.nextDialogue.nodeId;
    overlay.showDialogue(result.nextDialogue, (nextChoiceId) => {
      this.handleDialogueChoice(nextChoiceId);
    });
  }

  private closeDialogue(): void {
    this.dialogueOpen = false;
    this.currentNodeId = null;
    getOverlayController().hideDialogue();
  }

  private useProp(prop: PropDefinition): void {
    const overlay = getOverlayController();

    if (!gameState.matchesConditions(prop)) {
      return;
    }

    prop.action.setFlags?.forEach((flag) => {
      gameState.setFlag(flag);
    });

    const notifications = [prop.action.notification];

    if (prop.action.type === 'advanceQuest') {
      notifications.push(...advanceQuest(prop.action.questId));
    }

    notifications.forEach((message) => {
      overlay.pushToast(message);
    });

    this.updateInteractionPrompt();
  }
}
