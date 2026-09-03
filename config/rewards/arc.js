// Channel Point Rewards Configuration — Arc Raiders theme
// Add, edit, or remove rewards here

export const arcRewards = [
  {
    id: 'toss-a-dollar',
    title: 'Toss a Dollar at your Raider',
    cost: 10,
    prompt: 'Toss a dollar at your raider and show them some love!',
    is_enabled: true,
    is_user_input_required: false,
    background_color: '#4CAF50',
    should_redemptions_skip_request_queue: true,
    // No default_image yet — Twitch will use its stock icon until an Arc-specific one exists.
    animation: {
      type: 'raider-token',
      duration: 3000,
      audioObject: 'token',
    },
  },
];
