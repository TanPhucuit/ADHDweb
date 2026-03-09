export interface RewardItem {
  id: string
  title: string
  emoji: string
  stars: number
  description: string
}

// Default reward catalog shared between parent and child
export const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'r1', title: '30 phút chơi game', emoji: '🎮', stars: 20, description: 'Thêm 30 phút chơi game yêu thích' },
  { id: 'r2', title: 'Chọn món ăn tối', emoji: '🍕', stars: 25, description: 'Được chọn món ăn tối cho cả nhà' },
  { id: 'r3', title: 'Ngủ muộn 30 phút', emoji: '😴', stars: 15, description: 'Được đi ngủ muộn hơn 30 phút' },
  { id: 'r4', title: '1 tiếng xem YouTube', emoji: '📺', stars: 30, description: 'Xem video yêu thích thêm 1 tiếng' },
  { id: 'r5', title: 'Bữa ăn đặc biệt', emoji: '🍔', stars: 35, description: 'Được đặt đồ ăn hoặc đi nhà hàng' },
  { id: 'r6', title: 'Xem phim cùng gia đình', emoji: '🎬', stars: 40, description: 'Xem một bộ phim yêu thích với ba mẹ' },
  { id: 'r7', title: 'Mua truyện / sách mới', emoji: '📚', stars: 50, description: 'Được mua một cuốn truyện hoặc sách' },
  { id: 'r8', title: 'Đi công viên cuối tuần', emoji: '🌳', stars: 60, description: 'Cùng gia đình đi chơi công viên' },
]

// ------- Encoding helpers (reward info stored in action.actiontype) -------

export function encodeRewardRequest(rewardId: string, rewardStars: number, rewardTitle: string): string {
  // Format: reward_request|{id}|{stars}|{title}
  return `reward_request|${rewardId}|${rewardStars}|${rewardTitle}`
}

export function encodeRewardResponse(approved: boolean, rewardId: string, rewardStars: number, rewardTitle: string): string {
  const prefix = approved ? 'reward_approved' : 'reward_denied'
  return `${prefix}|${rewardId}|${rewardStars}|${rewardTitle}`
}

export interface DecodedReward {
  rewardId: string
  rewardStars: number
  rewardTitle: string
}

export function decodeRewardAction(actiontype: string): DecodedReward | null {
  const parts = actiontype.split('|')
  if (parts.length < 4) return null
  const stars = parseInt(parts[2])
  if (isNaN(stars)) return null
  return {
    rewardId: parts[1],
    rewardStars: stars,
    rewardTitle: parts.slice(3).join('|'),
  }
}

export function isRewardRequest(actiontype: string) { return actiontype.startsWith('reward_request|') }
export function isRewardApproved(actiontype: string) { return actiontype.startsWith('reward_approved|') }
export function isRewardDenied(actiontype: string) { return actiontype.startsWith('reward_denied|') }
