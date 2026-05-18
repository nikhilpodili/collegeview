
export function generateAvatarUrl(userId, gender) {
  const seed = encodeURIComponent(userId || 'anonymous');
  
  if (gender === 'male') {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&gender=male`;
  }
  
  if (gender === 'female') {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&gender=female`;
  }
  
  // Default/Neutral fallback for 'other', null, etc.
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
}
