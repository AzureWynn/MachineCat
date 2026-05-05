const RobotHTTPConnector = require('./src/core/robot-control/infrastructure/robot-connector.http');

async function main() {
  const robot = new RobotHTTPConnector('192.168.4.1');

  robot.on('command_sent', (data) => {
    console.log(`✅ 指令已发送: ${data.action} (状态码: ${data.statusCode})`);
  });

  robot.on('error', (error) => {
    console.error(`❌ 错误: ${error.message}`);
  });

  try {
    console.log('🔍 测试 ESP32 连接...');
    await robot.testConnection();
    console.log('✅ ESP32 连接成功！\n');

    console.log('📤 开始发送测试指令...');
    
    setTimeout(() => {
      console.log('\n1️⃣ 前进');
      robot.sendCommand('forward');
    }, 1000);

    setTimeout(() => {
      console.log('\n2️⃣ 停止');
      robot.sendCommand('stop');
    }, 3000);

    setTimeout(() => {
      console.log('\n3️⃣ 踢球');
      robot.sendCommand('kick');
    }, 5000);

    setTimeout(() => {
      console.log('\n4️⃣ 坐下');
      robot.sendCommand('sit');
    }, 7000);

    setTimeout(() => {
      console.log('\n✅ 测试完成');
      process.exit(0);
    }, 9000);

  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.log('\n请确保：');
    console.log('1. ESP32 已开机');
    console.log('2. 电脑已连接到 ESP32 热点 "catcontrol"');
    console.log('3. 热点密码: 12345678');
    process.exit(1);
  }
}

main();
