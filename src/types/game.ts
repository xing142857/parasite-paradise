export const MIRROR_ROLES = [
  '感应者',
  '清晰者',
  '思考者',
  '耳语者',
  '传递者',
  '预知者',
  '传承者',
  '支援者',
  '沉默者',
  '同调者',
  '指引者',
] as const

export type MirrorRole = typeof MIRROR_ROLES[number]

export const PROMOTED_ROLES = ['升华者', '凝滞者', '幻化者'] as const
export type PromotedRole = typeof PROMOTED_ROLES[number]

export interface FactionCounts {
  eternal: number;   // 永恒者阵营 (必须等于 coalescer)
  coalescer: number; // 凝聚者阵营 (必须等于 eternal)
  deceiver: number;  // 欺骗者阵营
  adapter: number;   // 适应者阵营
}

export interface SpecialRoles {
  inquisitor: boolean; // 审判者
  arbiter: boolean;    // 仲裁者
}

export interface PlayerPair {
  id: number;
  player: string;
  alias: string;
}

export interface CoreRoles {
  eternal: PlayerPair | null;   // 永恒者
  coalescer: PlayerPair | null; // 凝聚者
  deceiver: PlayerPair | null;  // 欺骗者
}

export interface MemberWithRole {
  alias: string;
  role: string;
}

export interface FinalAllocations {
  eternalMembers: MemberWithRole[];   // 领袖 (永恒者) + 5名成员 (带镜像身份)
  coalescerMembers: MemberWithRole[]; // 领袖 (凝聚者) + 5名成员 (带镜像身份)
  deceiverMembers: MemberWithRole[];  // 领袖 (欺骗者) + 初始追随者 (追随者 [原镜像身份])
  adapterMembers: MemberWithRole[];   // 初始晋升者 (升华者/凝滞者/幻化者) + 普通适应者 (适应者)
}

export interface InitialSetupData {
  factionCounts: FactionCounts;
  initialPromotedCount: number; // 适应者阵营初始晋升者数量
  customScopeSize: number;      // 永恒者与凝聚者划定召唤范围的人数 (不能低于被分配人数，双方必须一致)
  specialRoles: SpecialRoles;
  playerPairs: PlayerPair[];
  coreRoles: CoreRoles;
  
  // Step 3.2 驱逐 (选择的是镜像阵营里的身份)
  eternalBanishTarget: string; // 被永恒者驱逐的凝聚者身份
  eternalBanishNotified: boolean;
  coalescerBanishTarget: string; // 被凝聚者驱逐的永恒者身份
  coalescerBanishNotified: boolean;

  // Step 3.3 选定阵营镜像身份 (数量为 阵营人数 - 1)
  eternalSelectedRoles: string[];
  coalescerSelectedRoles: string[];
  
  // Step 3.4 12人范围与生成成员
  eternal12Scope: string[]; // 马甲名称
  eternalDrawnMembers: MemberWithRole[];
  coalescer12Scope: string[]; // 马甲名称
  coalescerDrawnMembers: MemberWithRole[];

  // 最终阵营与身份分配
  finalAllocations: FinalAllocations | null;
}
