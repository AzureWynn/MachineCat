use anchor_lang::prelude::*;

declare_id!("ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY");

#[program]
pub mod robot_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, robot_id: String) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.robot_id = robot_id.clone();
        state.mood = 50;
        state.bond = 30;
        state.energy = 80;
        state.streak = 0;
        state.authority = ctx.accounts.authority.key();
        state.last_updated = Clock::get()?.unix_timestamp;
        msg!("Robot state initialized for: {}", robot_id);
        Ok(())
    }

    pub fn update_state(
        ctx: Context<UpdateState>,
        mood_delta: i32,
        bond_delta: i32,
        energy_delta: i32,
        streak_delta: u32,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        
        state.mood = (state.mood as i32 + mood_delta).clamp(0, 100) as u8;
        state.bond = (state.bond as i32 + bond_delta).clamp(0, 100) as u8;
        state.energy = (state.energy as i32 + energy_delta).clamp(0, 100) as u8;
        state.streak += streak_delta;
        state.last_updated = Clock::get()?.unix_timestamp;
        
        msg!(
            "State updated - mood: {}, bond: {}, energy: {}, streak: {}",
            state.mood,
            state.bond,
            state.energy,
            state.streak
        );
        
        Ok(())
    }

    pub fn complete_quest(ctx: Context<UpdateState>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.streak += 1;
        state.last_updated = Clock::get()?.unix_timestamp;
        msg!("Quest completed! New streak: {}", state.streak);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(robot_id: String)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RobotState::INIT_SPACE,
        seeds = [b"state", authority.key().as_ref(), robot_id.as_bytes()],
        bump
    )]
    pub state: Account<'info, RobotState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateState<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [b"state", authority.key().as_ref(), state.robot_id.as_bytes()],
        bump
    )]
    pub state: Account<'info, RobotState>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct RobotState {
    #[max_len(64)]
    pub robot_id: String,
    pub mood: u8,
    pub bond: u8,
    pub energy: u8,
    pub streak: u32,
    pub authority: Pubkey,
    pub last_updated: i64,
}
