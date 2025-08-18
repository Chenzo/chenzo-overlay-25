// Channel Point Rewards Configuration
// Add, edit, or remove rewards here

export const rewards = [
  {
    id: 'fake-coin',
    title: 'Drop a Fake Coin',
    cost: 10,
    prompt: 'Drop a fake coin and make Twitch see you are engaging with the crew!',
    is_enabled: true,
    is_user_input_required: false,
    background_color: '#FFD54F',
    should_redemptions_skip_request_queue: true,
    image: {
      url_1x: 'https://chenzorama.com/overlay/twitch/redemption_icons/ac_28.png',
      url_2x: 'https://chenzorama.com/overlay/twitch/redemption_icons/ac_56.png',
      url_4x: 'https://chenzorama.com/overlay/twitch/redemption_icons/ac_112.png',
    },
    default_image: {
      url_1x: 'https://chenzorama.com/overlay/twitch/redemption_icons/ac_28.png',
      url_2x: 'https://chenzorama.com/overlay/twitch/redemption_icons/ac_56.png',
      url_4x: 'https://chenzorama.com/overlay/twitch/redemption_icons/ac_112.png',
    },
    // Animation settings
    animation: {
      type: 'ancient-coin',
      duration: 3000, // milliseconds
      // Audio is handled internally by the AncientCoin component
    },
  },
  {
    id: 'sail-away',
    title: 'Sail Away',
    cost: 150,
    prompt: 'Play the sailing away song!',
    is_enabled: true,
    is_user_input_required: false,
    background_color: '#4FC3F7',
    should_redemptions_skip_request_queue: true,
    default_image: {
      url_1x: 'https://chenzorama.com/overlay/twitch/redemption_icons/sail_28.png',
      url_2x: 'https://chenzorama.com/overlay/twitch/redemption_icons/sail_56.png',
      url_4x: 'https://chenzorama.com/overlay/twitch/redemption_icons/sail_112.png',
    },
    animation: {
      type: 'sail-away',
      duration: 5000, // 5 seconds for the song
      audioObject: 'sailingaway', // Use AudioObject system instead of direct sound
    },
  },
  {
    id: 'they-did-it',
    title: 'They Did It',
    cost: 1000,
    prompt: "Celebrate with Dora's sandwich song!",
    is_enabled: true,
    is_user_input_required: false,
    background_color: '#FF9800',
    should_redemptions_skip_request_queue: true,
    default_image: {
      url_1x: 'https://chenzorama.com/overlay/twitch/redemption_icons/celebration_28.png',
      url_2x: 'https://chenzorama.com/overlay/twitch/redemption_icons/celebration_56.png',
      url_4x: 'https://chenzorama.com/overlay/twitch/redemption_icons/celebration_112.png',
    },
    animation: {
      type: 'they-did-it',
      duration: 5000, // 5 seconds for the song
      audioObject: 'dora', // Use AudioObject system to play dora.mp3
    },
  },
  // Add more rewards here:
  // {
  //   id: 'another-reward',
  //   title: 'Another Reward',
  //   cost: 50,
  //   prompt: 'Description for another reward',
  //   is_enabled: true,
  //   is_user_input_required: false,
  //   background_color: '#FF6B6B',
  //   should_redemptions_skip_request_queue: true,
  //   default_image: {
  //     url_1x: 'https://chenzorama.com/overlay/twitch/redemption_icons/another_28.png',
  //     url_2x: 'https://chenzorama.com/overlay/twitch/redemption_icons/another_56.png',
  //     url_4x: 'https://chenzorama.com/overlay/twitch/redemption_icons/another_112.png',
  //   },
  //   animation: {
  //     type: 'custom-animation',
  //     duration: 5000,
  //     sound: '/audio/another-sound.mp3',
  //     volume: 0.3,
  //   },
  // },
];

// Helper function to get reward by ID
export const getRewardById = (id) => {
  return rewards.find((reward) => reward.id === id);
};

// Helper function to get reward by title (case-insensitive)
export const getRewardByTitle = (title) => {
  return rewards.find((reward) => reward.title.toLowerCase().includes(title.toLowerCase()));
};

// Helper function to get all enabled rewards
export const getEnabledRewards = () => {
  return rewards.filter((reward) => reward.is_enabled);
};

// Default settings for all rewards
export const defaultRewardSettings = {
  is_enabled: true,
  is_user_input_required: false,
  should_redemptions_skip_request_queue: true,
  animation: {
    duration: 3000,
    volume: 0.5,
  },
};
