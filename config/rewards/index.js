import { sotRewards } from './sot';
import { arcRewards } from './arc';

export const rewardsByTheme = {
  SoT: sotRewards,
  Arc: arcRewards,
};

// Reward titles managed by this system across all themes, so RewardCreator can tell the
// difference between "belongs to a theme that isn't active right now" and "not ours to touch".
export const allManagedRewardTitles = Object.values(rewardsByTheme)
  .flat()
  .map((reward) => reward.title.toLowerCase());
