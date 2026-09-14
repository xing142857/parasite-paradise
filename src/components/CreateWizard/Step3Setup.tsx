import React, { useState } from 'react'
import type {
  InitialSetupData,
  CoreRoles,
  MemberWithRole,
  FinalAllocations,
} from '../../types/game'
import { MIRROR_ROLES, PROMOTED_ROLES } from '../../types/game'

interface Step3Props {
  setupData: InitialSetupData
  onUpdateSetupData: (updater: (prev: InitialSetupData) => InitialSetupData) => void
  onPrev: () => void
  onFinish: () => void
}

export const Step3Setup: React.FC<Step3Props> = ({
  setupData,
  onUpdateSetupData,
  onPrev,
  onFinish,
}) => {
  const {
    factionCounts,
    initialPromotedCount,
    playerPairs,
    coreRoles,
    eternalBanishTarget,
    eternalBanishNotified,
    coalescerBanishTarget,
    coalescerBanishNotified,
    eternalSelectedRoles,
    coalescerSelectedRoles,
    eternal12Scope,
    eternalDrawnMembers,
    coalescer12Scope,
    coalescerDrawnMembers,
    finalAllocations,
  } = setupData

  const [subStep, setSubStep] = useState<number>(1)

  const eternalNeededRolesCount = factionCounts.eternal - 1
  const coalescerNeededRolesCount = factionCounts.coalescer - 1

  // Candidate aliases excluding core leaders
  const coreLeaderAliases = [
    coreRoles.eternal?.alias,
    coreRoles.coalescer?.alias,
    coreRoles.deceiver?.alias,
  ].filter(Boolean) as string[]

  const nonLeaderAliases = playerPairs
    .map((p) => p.alias)
    .filter((alias) => !coreLeaderAliases.includes(alias))

  const minScopeSize = Math.max(1, eternalNeededRolesCount)
  const maxScopeSize = Math.max(minScopeSize, nonLeaderAliases.length)

  // Scope size cannot be below needed count (eternalNeededRolesCount)
  const rawScopeSize = setupData.customScopeSize || 12
  const targetScopeSize = Math.max(minScopeSize, Math.min(maxScopeSize, rawScopeSize))

  const handleScopeSizeChange = (val: number) => {
    const newSize = Math.max(minScopeSize, Math.min(maxScopeSize, val))
    onUpdateSetupData((prev) => ({
      ...prev,
      customScopeSize: newSize,
      eternal12Scope: prev.eternal12Scope.length > newSize ? prev.eternal12Scope.slice(0, newSize) : prev.eternal12Scope,
      coalescer12Scope: prev.coalescer12Scope.length > newSize ? prev.coalescer12Scope.slice(0, newSize) : prev.coalescer12Scope,
      eternalDrawnMembers: [],
      coalescerDrawnMembers: [],
      finalAllocations: null,
    }))
  }

  // -------------------------------------------------------------
  // Sub-step 3.1: Random Core Roles
  // -------------------------------------------------------------
  const handleAssignCoreRoles = () => {
    if (playerPairs.length < 3) return
    const shuffled = [...playerPairs].sort(() => Math.random() - 0.5)

    const assignedCore: CoreRoles = {
      eternal: shuffled[0],
      coalescer: shuffled[1],
      deceiver: shuffled[2],
    }

    onUpdateSetupData((prev) => ({
      ...prev,
      coreRoles: assignedCore,
      eternal12Scope: [],
      eternalDrawnMembers: [],
      coalescer12Scope: [],
      coalescerDrawnMembers: [],
      finalAllocations: null,
    }))
  }

  // -------------------------------------------------------------
  // Sub-step 3.3: Selected Mirror Roles for Eternal and Coalescer
  // -------------------------------------------------------------
  const handleToggleEternalRole = (role: string) => {
    onUpdateSetupData((prev) => {
      const exists = prev.eternalSelectedRoles.includes(role)
      if (exists) {
        return {
          ...prev,
          eternalSelectedRoles: prev.eternalSelectedRoles.filter((r) => r !== role),
          eternalDrawnMembers: [],
          finalAllocations: null,
        }
      } else {
        if (prev.eternalSelectedRoles.length >= eternalNeededRolesCount) return prev
        return {
          ...prev,
          eternalSelectedRoles: [...prev.eternalSelectedRoles, role],
          eternalDrawnMembers: [],
          finalAllocations: null,
        }
      }
    })
  }

  const handleToggleCoalescerRole = (role: string) => {
    onUpdateSetupData((prev) => {
      const exists = prev.coalescerSelectedRoles.includes(role)
      if (exists) {
        return {
          ...prev,
          coalescerSelectedRoles: prev.coalescerSelectedRoles.filter((r) => r !== role),
          coalescerDrawnMembers: [],
          finalAllocations: null,
        }
      } else {
        if (prev.coalescerSelectedRoles.length >= coalescerNeededRolesCount) return prev
        return {
          ...prev,
          coalescerSelectedRoles: [...prev.coalescerSelectedRoles, role],
          coalescerDrawnMembers: [],
          finalAllocations: null,
        }
      }
    })
  }

  const handleAutoPickRoles = () => {
    // Eternal cannot pick coalescerBanishTarget
    // Coalescer cannot pick eternalBanishTarget
    // They CAN choose overlapping mirror roles
    const eternalAvailable = MIRROR_ROLES.filter((r) => r !== coalescerBanishTarget)
    const coalescerAvailable = MIRROR_ROLES.filter((r) => r !== eternalBanishTarget)

    const shuffledEternal = [...eternalAvailable].sort(() => Math.random() - 0.5)
    const shuffledCoalescer = [...coalescerAvailable].sort(() => Math.random() - 0.5)

    const eternalList = shuffledEternal.slice(0, eternalNeededRolesCount)
    const coalescerList = shuffledCoalescer.slice(0, coalescerNeededRolesCount)

    onUpdateSetupData((prev) => ({
      ...prev,
      eternalSelectedRoles: eternalList,
      coalescerSelectedRoles: coalescerList,
      eternalDrawnMembers: [],
      coalescerDrawnMembers: [],
      finalAllocations: null,
    }))
  }

  // -------------------------------------------------------------
  // Sub-step 3.4: Scope & Draw Members for Eternal and Coalescer
  // -------------------------------------------------------------
  const handleToggleEternalScope = (alias: string) => {
    onUpdateSetupData((prev) => {
      const exists = prev.eternal12Scope.includes(alias)
      if (exists) {
        return {
          ...prev,
          eternal12Scope: prev.eternal12Scope.filter((a) => a !== alias),
          eternalDrawnMembers: [],
          finalAllocations: null,
        }
      } else {
        if (prev.eternal12Scope.length >= targetScopeSize) return prev
        return {
          ...prev,
          eternal12Scope: [...prev.eternal12Scope, alias],
          eternalDrawnMembers: [],
          finalAllocations: null,
        }
      }
    })
  }

  const handleRandomScopeEternal = () => {
    const shuffled = [...nonLeaderAliases].sort(() => Math.random() - 0.5)
    const pickedScope = shuffled.slice(0, targetScopeSize)
    onUpdateSetupData((prev) => ({
      ...prev,
      eternal12Scope: pickedScope,
      eternalDrawnMembers: [],
      finalAllocations: null,
    }))
  }

  const handleDrawEternalMembers = () => {
    if (eternal12Scope.length !== targetScopeSize) return
    // Exclude any aliases already drawn in coalescerDrawnMembers
    const existingCoalescerAliases = coalescerDrawnMembers.map((m) => m.alias)
    const validCandidates = eternal12Scope.filter((a) => !existingCoalescerAliases.includes(a))

    if (validCandidates.length < eternalNeededRolesCount) {
      alert(`永恒者范围中可用的未重复成员不足 ${eternalNeededRolesCount} 人，请调整范围。`)
      return
    }

    const shuffledAliases = [...validCandidates].sort(() => Math.random() - 0.5)
    const pickedAliases = shuffledAliases.slice(0, eternalNeededRolesCount)

    // Pair with random roles from eternalSelectedRoles
    const shuffledRoles = [...eternalSelectedRoles].sort(() => Math.random() - 0.5)
    const membersWithRoles: MemberWithRole[] = pickedAliases.map((alias, idx) => ({
      alias,
      role: shuffledRoles[idx] || '成员身份',
    }))

    onUpdateSetupData((prev) => ({
      ...prev,
      eternalDrawnMembers: membersWithRoles,
      finalAllocations: null,
    }))
  }

  const handleToggleCoalescerScope = (alias: string) => {
    onUpdateSetupData((prev) => {
      const exists = prev.coalescer12Scope.includes(alias)
      if (exists) {
        return {
          ...prev,
          coalescer12Scope: prev.coalescer12Scope.filter((a) => a !== alias),
          coalescerDrawnMembers: [],
          finalAllocations: null,
        }
      } else {
        if (prev.coalescer12Scope.length >= targetScopeSize) return prev
        return {
          ...prev,
          coalescer12Scope: [...prev.coalescer12Scope, alias],
          coalescerDrawnMembers: [],
          finalAllocations: null,
        }
      }
    })
  }

  const handleRandomScopeCoalescer = () => {
    const shuffled = [...nonLeaderAliases].sort(() => Math.random() - 0.5)
    const pickedScope = shuffled.slice(0, targetScopeSize)
    onUpdateSetupData((prev) => ({
      ...prev,
      coalescer12Scope: pickedScope,
      coalescerDrawnMembers: [],
      finalAllocations: null,
    }))
  }

  const handleDrawCoalescerMembers = () => {
    if (coalescer12Scope.length !== targetScopeSize) return
    // Exclude any aliases already drawn in eternalDrawnMembers
    const existingEternalAliases = eternalDrawnMembers.map((m) => m.alias)
    const validCandidates = coalescer12Scope.filter((a) => !existingEternalAliases.includes(a))

    if (validCandidates.length < coalescerNeededRolesCount) {
      alert(`凝聚者范围中可用的未重复成员不足 ${coalescerNeededRolesCount} 人，请调整范围。`)
      return
    }

    const shuffledAliases = [...validCandidates].sort(() => Math.random() - 0.5)
    const pickedAliases = shuffledAliases.slice(0, coalescerNeededRolesCount)

    // Pair with random roles from coalescerSelectedRoles
    const shuffledRoles = [...coalescerSelectedRoles].sort(() => Math.random() - 0.5)
    const membersWithRoles: MemberWithRole[] = pickedAliases.map((alias, idx) => ({
      alias,
      role: shuffledRoles[idx] || '成员身份',
    }))

    onUpdateSetupData((prev) => ({
      ...prev,
      coalescerDrawnMembers: membersWithRoles,
      finalAllocations: null,
    }))
  }

  // -------------------------------------------------------------
  // Sub-step 3.5: Final Allocations Calculation
  // -------------------------------------------------------------
  const handleGenerateFinalAllocations = () => {
    if (!coreRoles.eternal || !coreRoles.coalescer || !coreRoles.deceiver) return

    const eternalLeader = coreRoles.eternal.alias
    const coalescerLeader = coreRoles.coalescer.alias
    const deceiverLeader = coreRoles.deceiver.alias

    const eternalMembers: MemberWithRole[] = [
      { alias: eternalLeader, role: '永恒者 (领袖)' },
      ...eternalDrawnMembers,
    ]

    const coalescerMembers: MemberWithRole[] = [
      { alias: coalescerLeader, role: '凝聚者 (领袖)' },
      ...coalescerDrawnMembers,
    ]

    // Assigned so far
    const assignedAliases = new Set<string>([
      eternalLeader,
      coalescerLeader,
      deceiverLeader,
      ...eternalDrawnMembers.map((m) => m.alias),
      ...coalescerDrawnMembers.map((m) => m.alias),
    ])

    const unassignedAliases = playerPairs
      .map((p) => p.alias)
      .filter((alias) => !assignedAliases.has(alias))

    // Shuffle unassigned
    const shuffledUnassigned = [...unassignedAliases].sort(() => Math.random() - 0.5)

    // Deceiver followers count = deceiverCount - 1
    const followerCount = Math.max(0, factionCounts.deceiver - 1)
    const followerAliases = shuffledUnassigned.slice(0, followerCount)
    const remainingForAdapters = shuffledUnassigned.slice(followerCount)

    // Deceiver followers assign random mirror role
    const deceiverMembers: MemberWithRole[] = [
      { alias: deceiverLeader, role: '欺骗者 (领袖)' },
      ...followerAliases.map((alias) => {
        const randomMirror = MIRROR_ROLES[Math.floor(Math.random() * MIRROR_ROLES.length)]
        return {
          alias,
          role: `追随者 (原${randomMirror})`,
        }
      }),
    ]

    // Adapters: assign initial promoted ones
    const shuffledAdapterAliases = [...remainingForAdapters].sort(() => Math.random() - 0.5)
    const promotedCount = Math.min(initialPromotedCount, shuffledAdapterAliases.length)

    const promotedAliases = shuffledAdapterAliases.slice(0, promotedCount)
    const normalAdapterAliases = shuffledAdapterAliases.slice(promotedCount)

    const adapterMembers: MemberWithRole[] = [
      ...promotedAliases.map((alias) => {
        const randomPromoted = PROMOTED_ROLES[Math.floor(Math.random() * PROMOTED_ROLES.length)]
        return {
          alias,
          role: `${randomPromoted} (初始晋升者)`,
        }
      }),
      ...normalAdapterAliases.map((alias) => ({
        alias,
        role: '适应者',
      })),
    ]

    const allocations: FinalAllocations = {
      eternalMembers,
      coalescerMembers,
      deceiverMembers,
      adapterMembers,
    }

    onUpdateSetupData((prev) => ({
      ...prev,
      finalAllocations: allocations,
    }))
  }

  // -------------------------------------------------------------
  // Validation Checks for Progress
  // -------------------------------------------------------------
  const isSub1Done = Boolean(coreRoles.eternal && coreRoles.coalescer && coreRoles.deceiver)

  const isSub2Done =
    isSub1Done &&
    eternalBanishTarget.trim() !== '' &&
    eternalBanishNotified &&
    coalescerBanishTarget.trim() !== '' &&
    coalescerBanishNotified

  const isSub3Done =
    isSub2Done &&
    eternalSelectedRoles.length === eternalNeededRolesCount &&
    coalescerSelectedRoles.length === coalescerNeededRolesCount

  const isSub4Done =
    isSub3Done &&
    eternal12Scope.length === targetScopeSize &&
    eternalDrawnMembers.length === eternalNeededRolesCount &&
    coalescer12Scope.length === targetScopeSize &&
    coalescerDrawnMembers.length === coalescerNeededRolesCount

  const isSub5Done = Boolean(isSub4Done && finalAllocations)

  return (
    <div className="wizard-step-container">
      <div className="step-header">
        <h2 className="step-title">第三步：核心身份发放与初始启动</h2>
        <p className="step-subtitle">
          按照流程完成核心发牌、镜像驱逐、选择阵营身份、12马甲范围生成5人，以及最终阵营全图分发。
        </p>
      </div>

      {/* Sub-step Navigation / Progress Tabs */}
      <div className="substep-tabs">
        <button
          type="button"
          className={`substep-tab ${subStep === 1 ? 'active' : ''} ${isSub1Done ? 'completed' : ''}`}
          onClick={() => setSubStep(1)}
        >
          <span className="tab-num">3.1</span>
          <span>发放三大核心身份</span>
          {isSub1Done && <span className="tab-check">✓</span>}
        </button>

        <button
          type="button"
          className={`substep-tab ${subStep === 2 ? 'active' : ''} ${isSub2Done ? 'completed' : ''}`}
          disabled={!isSub1Done}
          onClick={() => setSubStep(2)}
        >
          <span className="tab-num">3.2</span>
          <span>镜像驱逐与 QQ 通知</span>
          {isSub2Done && <span className="tab-check">✓</span>}
        </button>

        <button
          type="button"
          className={`substep-tab ${subStep === 3 ? 'active' : ''} ${isSub3Done ? 'completed' : ''}`}
          disabled={!isSub2Done}
          onClick={() => setSubStep(3)}
        >
          <span className="tab-num">3.3</span>
          <span>选定阵营包含身份</span>
          {isSub3Done && <span className="tab-check">✓</span>}
        </button>

        <button
          type="button"
          className={`substep-tab ${subStep === 4 ? 'active' : ''} ${isSub4Done ? 'completed' : ''}`}
          disabled={!isSub3Done}
          onClick={() => setSubStep(4)}
        >
          <span className="tab-num">3.4</span>
          <span>12马甲范围 & 抽5人</span>
          {isSub4Done && <span className="tab-check">✓</span>}
        </button>

        <button
          type="button"
          className={`substep-tab ${subStep === 5 ? 'active' : ''} ${isSub5Done ? 'completed' : ''}`}
          disabled={!isSub4Done}
          onClick={() => setSubStep(5)}
        >
          <span className="tab-num">3.5</span>
          <span>全图阵营身份结算</span>
          {isSub5Done && <span className="tab-check">✓</span>}
        </button>
      </div>

      {/* ==================== SUB-STEP 3.1 ==================== */}
      {subStep === 1 && (
        <div className="substep-panel">
          <div className="panel-header">
            <h3>3.1 随机发放【永恒者】【凝聚者】【欺骗者】核心身份</h3>
            <p>从输入的 {playerPairs.length} 个马甲中，随机抽出 3 人担任三大核心阵营领袖。</p>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleAssignCoreRoles}
            >
              🎲 {isSub1Done ? '重新随机发放核心身份' : '随机发放核心身份'}
            </button>
          </div>

          {isSub1Done && (
            <div className="core-roles-cards">
              <div className="core-role-card eternal">
                <div className="role-badge">永恒者阵营领袖</div>
                <div className="role-identity">永恒者</div>
                <div className="alias-name">
                  马甲：<strong>{coreRoles.eternal?.alias}</strong>
                </div>
              </div>

              <div className="core-role-card coalescer">
                <div className="role-badge">凝聚者阵营领袖</div>
                <div className="role-identity">凝聚者</div>
                <div className="alias-name">
                  马甲：<strong>{coreRoles.coalescer?.alias}</strong>
                </div>
              </div>

              <div className="core-role-card deceiver">
                <div className="role-badge">欺骗者阵营领袖</div>
                <div className="role-identity">欺骗者</div>
                <div className="alias-name">
                  马甲：<strong>{coreRoles.deceiver?.alias}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="substep-next-bar">
            <button
              type="button"
              className="btn primary-btn"
              disabled={!isSub1Done}
              onClick={() => setSubStep(2)}
            >
              下一步 (3.2 镜像驱逐) →
            </button>
          </div>
        </div>
      )}

      {/* ==================== SUB-STEP 3.2 ==================== */}
      {subStep === 2 && (
        <div className="substep-panel">
          <div className="panel-header">
            <h3>3.2 永恒者与凝聚者镜像身份驱逐与 QQ 通知</h3>
            <p>
              【驱除】：永恒者与凝聚者在游戏开始前从对方阵营身份（镜像阵营）中选择一个驱逐，并须通过 QQ 私信通知对方。
            </p>
          </div>

          <div className="banish-grid">
            {/* Eternal Banish Coalescer Role */}
            <div className="banish-card eternal-banish">
              <div className="card-header">
                <span className="dot eternal-dot"></span>
                <h4>永恒者 ({coreRoles.eternal?.alias}) 驱逐凝聚阵营镜像身份</h4>
              </div>
              <div className="form-group">
                <label>选择驱逐的【镜像阵营】身份：</label>
                <select
                  className="text-input"
                  value={eternalBanishTarget}
                  onChange={(e) =>
                    onUpdateSetupData((prev) => ({
                      ...prev,
                      eternalBanishTarget: e.target.value,
                      eternalSelectedRoles: [],
                      coalescerSelectedRoles: [],
                      finalAllocations: null,
                    }))
                  }
                >
                  <option value="">-- 请选择被驱逐的镜像身份 --</option>
                  {MIRROR_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={eternalBanishNotified}
                  onChange={(e) =>
                    onUpdateSetupData((prev) => ({
                      ...prev,
                      eternalBanishNotified: e.target.checked,
                    }))
                  }
                />
                <span>已通过 QQ 私信通知凝聚者 ({coreRoles.coalescer?.alias})</span>
              </label>
            </div>

            {/* Coalescer Banish Eternal Role */}
            <div className="banish-card coalescer-banish">
              <div className="card-header">
                <span className="dot coalescer-dot"></span>
                <h4>凝聚者 ({coreRoles.coalescer?.alias}) 驱逐永恒阵营镜像身份</h4>
              </div>
              <div className="form-group">
                <label>选择驱逐的【镜像阵营】身份：</label>
                <select
                  className="text-input"
                  value={coalescerBanishTarget}
                  onChange={(e) =>
                    onUpdateSetupData((prev) => ({
                      ...prev,
                      coalescerBanishTarget: e.target.value,
                      eternalSelectedRoles: [],
                      coalescerSelectedRoles: [],
                      finalAllocations: null,
                    }))
                  }
                >
                  <option value="">-- 请选择被驱逐的镜像身份 --</option>
                  {MIRROR_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={coalescerBanishNotified}
                  onChange={(e) =>
                    onUpdateSetupData((prev) => ({
                      ...prev,
                      coalescerBanishNotified: e.target.checked,
                    }))
                  }
                />
                <span>已通过 QQ 私信通知永恒者 ({coreRoles.eternal?.alias})</span>
              </label>
            </div>
          </div>

          <div className="substep-next-bar">
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => setSubStep(1)}
            >
              ← 返回 3.1
            </button>
            <button
              type="button"
              className="btn primary-btn"
              disabled={!isSub2Done}
              onClick={() => setSubStep(3)}
            >
              下一步 (3.3 选定阵营包含身份) →
            </button>
          </div>
        </div>
      )}

      {/* ==================== SUB-STEP 3.3 ==================== */}
      {subStep === 3 && (
        <div className="substep-panel">
          <div className="panel-header">
            <h3>3.3 选定永恒者与凝聚者包含的镜像身份</h3>
            <p>
              请为永恒者阵营选择 <strong>{eternalNeededRolesCount}</strong> 个身份，为凝聚者阵营选择 <strong>{coalescerNeededRolesCount}</strong> 个身份。<br />
              • 不能选择 3.2 中对方驱逐的身份（永恒者不可选：{coalescerBanishTarget || '无'}，凝聚者不可选：{eternalBanishTarget || '无'}）。<br />
              • 只要不选择对方驱逐的身份，两阵营可以各自选择（允许选择相同镜像身份）。
            </p>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleAutoPickRoles}
            >
              🎲 智能随机分布选定身份
            </button>
          </div>

          <div className="roles-selection-grid">
            {/* Eternal Selected Roles */}
            <div className="role-select-box eternal-box">
              <div className="box-title">
                <span className="dot eternal-dot"></span>
                <h4>永恒者阵营选定身份 ({eternalSelectedRoles.length} / {eternalNeededRolesCount})</h4>
              </div>
              <div className="chips-container">
                {MIRROR_ROLES.map((role) => {
                  const isSelectedBySelf = eternalSelectedRoles.includes(role)
                  const isBanishedByEnemy = role === coalescerBanishTarget

                  return (
                    <button
                      key={`eternal-role-${role}`}
                      type="button"
                      disabled={isBanishedByEnemy}
                      className={`role-chip ${isSelectedBySelf ? 'selected-eternal' : ''} ${
                        isBanishedByEnemy ? 'disabled' : ''
                      }`}
                      onClick={() => handleToggleEternalRole(role)}
                    >
                      {isSelectedBySelf && '✓ '}
                      {role}
                      {isBanishedByEnemy && <small> (已被驱逐)</small>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Coalescer Selected Roles */}
            <div className="role-select-box coalescer-box">
              <div className="box-title">
                <span className="dot coalescer-dot"></span>
                <h4>凝聚者阵营选定身份 ({coalescerSelectedRoles.length} / {coalescerNeededRolesCount})</h4>
              </div>
              <div className="chips-container">
                {MIRROR_ROLES.map((role) => {
                  const isSelectedBySelf = coalescerSelectedRoles.includes(role)
                  const isBanishedByEnemy = role === eternalBanishTarget

                  return (
                    <button
                      key={`coalescer-role-${role}`}
                      type="button"
                      disabled={isBanishedByEnemy}
                      className={`role-chip ${isSelectedBySelf ? 'selected-coalescer' : ''} ${
                        isBanishedByEnemy ? 'disabled' : ''
                      }`}
                      onClick={() => handleToggleCoalescerRole(role)}
                    >
                      {isSelectedBySelf && '✓ '}
                      {role}
                      {isBanishedByEnemy && <small> (已被驱逐)</small>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="substep-next-bar">
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => setSubStep(2)}
            >
              ← 返回 3.2
            </button>
            <button
              type="button"
              className="btn primary-btn"
              disabled={!isSub3Done}
              onClick={() => setSubStep(4)}
            >
              下一步 (3.4 划定12马甲与随机抽5人) →
            </button>
          </div>
        </div>
      )}

      {/* ==================== SUB-STEP 3.4 ==================== */}
      {subStep === 4 && (
        <div className="substep-panel">
          <div className="panel-header">
            <h3>3.4 划定 {targetScopeSize} 马甲范围并随机生成阵营成员与身份配对</h3>
            <p>
              永恒者与凝聚者分别划定 {targetScopeSize} 马甲范围（不可包含三大领袖），系统在各自范围内抽取对应数量的成员（永恒者抽取 {eternalNeededRolesCount} 人，凝聚者抽取 {coalescerNeededRolesCount} 人）并分配各自选定的镜像身份（两阵营抽取成员不得重复）。
            </p>
          </div>

          {/* Configurable Scope Size Bar */}
          <div className="scope-config-box">
            <div className="config-info">
              <span className="config-title">⚙️ 双方统一划定召唤范围人数：</span>
              <span className="config-desc">
                下限不能低于阵营被分配人数（{minScopeSize} 人），永恒者与凝聚者划定数量保持一致。
              </span>
            </div>
            <div className="counter-control">
              <button
                type="button"
                className="counter-btn"
                disabled={targetScopeSize <= minScopeSize}
                onClick={() => handleScopeSizeChange(targetScopeSize - 1)}
              >
                -
              </button>
              <input
                type="number"
                className="counter-input"
                min={minScopeSize}
                max={maxScopeSize}
                value={targetScopeSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  handleScopeSizeChange(isNaN(val) ? minScopeSize : val)
                }}
              />
              <button
                type="button"
                className="counter-btn"
                disabled={targetScopeSize >= maxScopeSize}
                onClick={() => handleScopeSizeChange(targetScopeSize + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Eternal Scope & Draw */}
          <div className="scope-section eternal-scope-box">
            <div className="scope-header">
              <div className="title-with-badge">
                <span className="dot eternal-dot"></span>
                <h4>永恒者 ({coreRoles.eternal?.alias}) 的 {targetScopeSize} 马甲划定范围</h4>
              </div>
              <div className="scope-counter">
                已选择：<strong>{eternal12Scope.length}</strong> / {targetScopeSize} 人
              </div>
            </div>

            <div className="scope-tools">
              <button
                type="button"
                className="btn small-btn"
                onClick={handleRandomScopeEternal}
              >
                🎲 随机选取 {targetScopeSize} 马甲
              </button>
              {eternal12Scope.length > 0 && (
                <button
                  type="button"
                  className="btn small-btn secondary"
                  onClick={() =>
                    onUpdateSetupData((prev) => ({
                      ...prev,
                      eternal12Scope: [],
                      eternalDrawnMembers: [],
                      finalAllocations: null,
                    }))
                  }
                >
                  清空已选
                </button>
              )}
            </div>

            <div className="player-chips-grid">
              {nonLeaderAliases.map((alias) => {
                const isSelected = eternal12Scope.includes(alias)
                return (
                  <button
                    key={`eternal-scope-${alias}`}
                    type="button"
                    className={`player-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleEternalScope(alias)}
                  >
                    {isSelected && <span className="chip-check">✓ </span>}
                    {alias}
                  </button>
                )
              })}
            </div>

            <div className="draw-action-area">
              <button
                type="button"
                className="btn primary-btn"
                disabled={eternal12Scope.length !== targetScopeSize}
                onClick={handleDrawEternalMembers}
              >
                🎲 从 {targetScopeSize} 马甲范围中随机抽取 {eternalNeededRolesCount} 人并分配永恒者身份
              </button>
            </div>

            {eternalDrawnMembers.length === eternalNeededRolesCount && (
              <div className="drawn-results eternal-results">
                <h5>✨ 生成的 {eternalDrawnMembers.length} 名永恒者成员与对应身份：</h5>
                <div className="result-chips">
                  {eternalDrawnMembers.map((m, idx) => (
                    <span key={idx} className="result-chip eternal-chip">
                      【{m.alias}】 ↔ {m.role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coalescer Scope & Draw */}
          <div className="scope-section coalescer-scope-box">
            <div className="scope-header">
              <div className="title-with-badge">
                <span className="dot coalescer-dot"></span>
                <h4>凝聚者 ({coreRoles.coalescer?.alias}) 的 {targetScopeSize} 马甲划定范围</h4>
              </div>
              <div className="scope-counter">
                已选择：<strong>{coalescer12Scope.length}</strong> / {targetScopeSize} 人
              </div>
            </div>

            <div className="scope-tools">
              <button
                type="button"
                className="btn small-btn"
                onClick={handleRandomScopeCoalescer}
              >
                🎲 随机选取 {targetScopeSize} 马甲
              </button>
              {coalescer12Scope.length > 0 && (
                <button
                  type="button"
                  className="btn small-btn secondary"
                  onClick={() =>
                    onUpdateSetupData((prev) => ({
                      ...prev,
                      coalescer12Scope: [],
                      coalescerDrawnMembers: [],
                      finalAllocations: null,
                    }))
                  }
                >
                  清空已选
                </button>
              )}
            </div>

            <div className="player-chips-grid">
              {nonLeaderAliases.map((alias) => {
                const isSelected = coalescer12Scope.includes(alias)
                return (
                  <button
                    key={`coalescer-scope-${alias}`}
                    type="button"
                    className={`player-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleCoalescerScope(alias)}
                  >
                    {isSelected && <span className="chip-check">✓ </span>}
                    {alias}
                  </button>
                )
              })}
            </div>

            <div className="draw-action-area">
              <button
                type="button"
                className="btn primary-btn"
                disabled={coalescer12Scope.length !== targetScopeSize}
                onClick={handleDrawCoalescerMembers}
              >
                🎲 从 {targetScopeSize} 马甲范围中随机抽取 {coalescerNeededRolesCount} 人并分配凝聚者身份
              </button>
            </div>

            {coalescerDrawnMembers.length === coalescerNeededRolesCount && (
              <div className="drawn-results coalescer-results">
                <h5>✨ 生成的 {coalescerDrawnMembers.length} 名凝聚者成员与对应身份：</h5>
                <div className="result-chips">
                  {coalescerDrawnMembers.map((m, idx) => (
                    <span key={idx} className="result-chip coalescer-chip">
                      【{m.alias}】 ↔ {m.role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="substep-next-bar">
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => setSubStep(3)}
            >
              ← 返回 3.3
            </button>
            <button
              type="button"
              className="btn primary-btn"
              disabled={!isSub4Done}
              onClick={() => {
                handleGenerateFinalAllocations()
                setSubStep(5)
              }}
            >
              下一步 (3.5 全图阵营身份结算) →
            </button>
          </div>
        </div>
      )}

      {/* ==================== SUB-STEP 3.5 ==================== */}
      {subStep === 5 && (
        <div className="substep-panel">
          <div className="panel-header">
            <h3>3.5 全图阵营与身份结算生成</h3>
            <p>
              系统已根据规则自动生成四大阵营的全部马甲归属、追随者与初始晋升者：
            </p>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="btn primary-btn"
              onClick={handleGenerateFinalAllocations}
            >
              🔄 重新随机计算全图阵营与身份
            </button>
          </div>

          {/* Display Scope Info */}
          <div className="scope-summary-card">
            <h4>🎯 永恒者与凝聚者划定范围信息</h4>
            <div className="scope-summary-body">
              <div>
                <strong>永恒者划定范围 ({eternal12Scope.length} 马甲)：</strong>
                <span>{eternal12Scope.join(', ')}</span>
              </div>
              <div>
                <strong>凝聚者划定范围 ({coalescer12Scope.length} 马甲)：</strong>
                <span>{coalescer12Scope.join(', ')}</span>
              </div>
            </div>
          </div>

          {finalAllocations && (
            <div className="allocations-overview-grid">
              {/* Eternal Faction */}
              <div className="faction-alloc-card eternal">
                <h4>永恒者阵营 ({finalAllocations.eternalMembers.length} 人)</h4>
                <ul className="alloc-list">
                  {finalAllocations.eternalMembers.map((m, i) => (
                    <li key={i}>
                      <strong>{m.alias}</strong> <span className="role-tag">{m.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coalescer Faction */}
              <div className="faction-alloc-card coalescer">
                <h4>凝聚者阵营 ({finalAllocations.coalescerMembers.length} 人)</h4>
                <ul className="alloc-list">
                  {finalAllocations.coalescerMembers.map((m, i) => (
                    <li key={i}>
                      <strong>{m.alias}</strong> <span className="role-tag">{m.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deceiver Faction */}
              <div className="faction-alloc-card deceiver">
                <h4>欺骗者阵营 ({finalAllocations.deceiverMembers.length} 人)</h4>
                <ul className="alloc-list">
                  {finalAllocations.deceiverMembers.map((m, i) => (
                    <li key={i}>
                      <strong>{m.alias}</strong> <span className="role-tag">{m.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Adapter Faction */}
              <div className="faction-alloc-card adapter">
                <h4>适应者阵营 ({finalAllocations.adapterMembers.length} 人)</h4>
                <ul className="alloc-list">
                  {finalAllocations.adapterMembers.map((m, i) => (
                    <li key={i}>
                      <strong>{m.alias}</strong> <span className="role-tag">{m.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="substep-next-bar">
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => setSubStep(4)}
            >
              ← 返回 3.4
            </button>
          </div>
        </div>
      )}

      {/* Global Wizard Footer Actions */}
      <div className="step-actions">
        <button type="button" className="btn secondary-btn" onClick={onPrev}>
          ← 上一步 (第二步)
        </button>
        <button
          type="button"
          className="btn finish-btn"
          disabled={!isSub5Done}
          onClick={onFinish}
        >
          🎉 完成建房与初始配置 / 查看完整对局报告 →
        </button>
      </div>
    </div>
  )
}
