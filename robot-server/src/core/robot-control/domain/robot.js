class Robot {
  constructor(id) {
    this.id = id; // 唯一标识符，例如 WebSocket 连接的 ID
    this.connectionStatus = 'disconnected';
    this.currentState = 'idle'; // e.g., idle, moving, executing_sequence
    this.batteryLevel = 100;
    this.supportedActions = []; // e.g., ['move', 'turn', 'kick']
  }

  connect() {
    this.connectionStatus = 'connected';
    console.log(`Robot [${this.id}] connected.`);
    // 在这里可以发布一个领域事件, e.g., DomainEvents.raise(new RobotConnectedEvent(this.id))
  }

  disconnect() {
    this.connectionStatus = 'disconnected';
    console.log(`Robot [${this.id}] disconnected.`);
    // 在这里可以发布一个领域事件, e.g., DomainEvents.raise(new RobotDisconnectedEvent(this.id))
  }

  updateBatteryLevel(level) {
    if (level >= 0 && level <= 100) {
      this.batteryLevel = level;
    }
  }

  updateState(newState) {
    this.currentState = newState;
  }

  executeCommand(command) {
    // 业务规则校验：例如，如果机器人正在执行复杂序列，可能不允许执行新的移动指令
    if (this.currentState === 'executing_sequence') {
      console.warn(`Robot [${this.id}] is busy and cannot execute command now.`);
      return;
    }

    console.log(`Robot [${this.id}] preparing to execute command:`, command);
    // 在这里可以发布一个领域事件，由基础设施层的 WebSocket 连接器监听并发送给物理机器人
    // e.g., DomainEvents.raise(new CommandIssuedEvent(this.id, command))
  }
}

module.exports = Robot;
