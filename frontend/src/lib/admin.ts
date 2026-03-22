// 관리자 ID 목록
const ADMIN_IDS = [
  "kakao_4802678399",
  "google_106402324266385753047",
];

export function isAdmin(userId: string | undefined): boolean {
  return !!userId && ADMIN_IDS.includes(userId);
}
