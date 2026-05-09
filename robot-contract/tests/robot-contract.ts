import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RobotContract } from "../target/types/robot_contract";
import { assert } from "chai";

describe("robot-contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.robotContract as Program<RobotContract>;
  const robotId = "test-robot-001";

  it("初始化机器人状态", async () => {
    const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), Buffer.from(robotId)],
      program.programId
    );

    const tx = await program.methods
      .initialize(robotId)
      .accounts({
        state: statePda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("初始化交易签名:", tx);

    const state = await program.account.robotState.fetch(statePda);
    assert.equal(state.robotId, robotId);
    assert.equal(state.mood, 50);
    assert.equal(state.bond, 30);
    assert.equal(state.energy, 80);
    assert.equal(state.streak, 0);
    assert.equal(state.authority.toBase58(), provider.wallet.publicKey.toBase58());
  });

  it("更新机器人状态", async () => {
    const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), Buffer.from(robotId)],
      program.programId
    );

    const tx = await program.methods
      .updateState(10, 5, -5, 1)
      .accounts({
        state: statePda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("更新状态交易签名:", tx);

    const state = await program.account.robotState.fetch(statePda);
    assert.equal(state.mood, 60);
    assert.equal(state.bond, 35);
    assert.equal(state.energy, 75);
    assert.equal(state.streak, 1);
  });

  it("完成任务增加 streak", async () => {
    const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), Buffer.from(robotId)],
      program.programId
    );

    const tx = await program.methods
      .completeQuest()
      .accounts({
        state: statePda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("完成任务交易签名:", tx);

    const state = await program.account.robotState.fetch(statePda);
    assert.equal(state.streak, 2);
  });

  it("状态值边界检查 - mood 不超过 100", async () => {
    const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), Buffer.from(robotId)],
      program.programId
    );

    await program.methods
      .updateState(50, 0, 0, 0)
      .accounts({
        state: statePda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const state = await program.account.robotState.fetch(statePda);
    assert.equal(state.mood, 100);
  });

  it("状态值边界检查 - mood 不低于 0", async () => {
    const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), Buffer.from(robotId)],
      program.programId
    );

    await program.methods
      .updateState(-200, 0, 0, 0)
      .accounts({
        state: statePda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const state = await program.account.robotState.fetch(statePda);
    assert.equal(state.mood, 0);
  });
});
