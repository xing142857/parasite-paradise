import React, { useState } from 'react'
import type { InitialSetupData } from '../../types/game'

interface SummaryProps {
  setupData: InitialSetupData
  onRestart: () => void
}

export const GameSummary: React.FC<SummaryProps> = ({ setupData, onRestart }) => {
  const [copied, setCopied] = useState(false)
  const {
    factionCounts,
    initialPromotedCount,
    specialRoles,
    playerPairs,
    coreRoles,
    eternalBanishTarget,
    coalescerBanishTarget,
    eternalSelectedRoles,
    coalescerSelectedRoles,
    eternal12Scope,
    coalescer12Scope,
    finalAllocations,
  } = setupData

  const totalPlayers = playerPairs.length

  const handleCopyReport = () => {
    const reportText = `
【Parasite Paradise 寄生天堂 - 游戏初始配置报告】

一、四大阵营与附加身份
- 永恒阵营: ${factionCounts.eternal}人
- 凝聚阵营: ${factionCounts.coalescer}人
- 欺骗阵营: ${factionCounts.deceiver}人 (含 ${Math.max(0, factionCounts.deceiver - 1)} 个初始追随者)
- 适应阵营: ${factionCounts.adapter}人 (含 ${initialPromotedCount} 个初始晋升者)
- 总人数: ${totalPlayers}人
- 附加身份: 审判者 (${specialRoles.inquisitor ? '已启用' : '未启用'}), 仲裁者 (${specialRoles.arbiter ? '已启用' : '未启用'})

二、三大核心发牌领袖 (马甲)
- 永恒者: ${coreRoles.eternal?.alias || '无'}
- 凝聚者: ${coreRoles.coalescer?.alias || '无'}
- 欺骗者: ${coreRoles.deceiver?.alias || '无'}

三、镜像身份驱逐情况 (已QQ通知)
- 永恒者驱逐凝聚者身份: ${eternalBanishTarget || '无'}
- 凝聚者驱逐永恒者身份: ${coalescerBanishTarget || '无'}

四、选定阵营镜像身份与划定范围
- 永恒者选定身份: ${eternalSelectedRoles.join(', ')}
- 永恒者划定范围 (${eternal12Scope.length}人): ${eternal12Scope.join(', ')}
- 凝聚者选定身份: ${coalescerSelectedRoles.join(', ')}
- 凝聚者划定范围 (${coalescer12Scope.length}人): ${coalescer12Scope.join(', ')}

五、全图四大阵营马甲与身份完整分配列表
1. 永恒阵营 (${finalAllocations?.eternalMembers.length || 0}人):
${finalAllocations?.eternalMembers.map((m) => `   • 马甲: ${m.alias} ↔ 身份: ${m.role}`).join('\n') || '暂无'}

2. 凝聚阵营 (${finalAllocations?.coalescerMembers.length || 0}人):
${finalAllocations?.coalescerMembers.map((m) => `   • 马甲: ${m.alias} ↔ 身份: ${m.role}`).join('\n') || '暂无'}

3. 欺骗阵营 (${finalAllocations?.deceiverMembers.length || 0}人):
${finalAllocations?.deceiverMembers.map((m) => `   • 马甲: ${m.alias} ↔ 身份: ${m.role}`).join('\n') || '暂无'}

4. 适应阵营 (${finalAllocations?.adapterMembers.length || 0}人):
${finalAllocations?.adapterMembers.map((m) => `   • 马甲: ${m.alias} ↔ 身份: ${m.role}`).join('\n') || '暂无'}
`.trim()

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="wizard-step-container">
      <div className="step-header">
        <div className="success-badge-large">✅</div>
        <h2 className="step-title">游戏初始配置完成！</h2>
        <p className="step-subtitle">
          全图马甲分配、核心身份发牌、镜像驱逐与四大阵营最终结算已顺利完成。
        </p>
      </div>

      <div className="summary-cards-grid">
        {/* Faction & Roles */}
        <div className="summary-card">
          <h3>📊 阵营与附加身份</h3>
          <ul className="summary-list">
            <li>永恒者阵营: <strong>{factionCounts.eternal}</strong> 人</li>
            <li>凝聚者阵营: <strong>{factionCounts.coalescer}</strong> 人</li>
            <li>欺骗者阵营: <strong>{factionCounts.deceiver}</strong> 人 <small>(含 {Math.max(0, factionCounts.deceiver - 1)} 个追随者)</small></li>
            <li>适应者阵营: <strong>{factionCounts.adapter}</strong> 人 <small>(含 {initialPromotedCount} 个初始晋升者)</small></li>
            <li>审判者: <strong>{specialRoles.inquisitor ? '已启用' : '未启用'}</strong></li>
            <li>仲裁者: <strong>{specialRoles.arbiter ? '已启用' : '未启用'}</strong></li>
          </ul>
        </div>

        {/* Core Leaders */}
        <div className="summary-card">
          <h3>👑 核心发牌领袖 (马甲)</h3>
          <ul className="summary-list">
            <li>
              <strong>永恒者领袖：</strong>
              <span>{coreRoles.eternal?.alias}</span>
            </li>
            <li>
              <strong>凝聚者领袖：</strong>
              <span>{coreRoles.coalescer?.alias}</span>
            </li>
            <li>
              <strong>欺骗者领袖：</strong>
              <span>{coreRoles.deceiver?.alias}</span>
            </li>
          </ul>
        </div>

        {/* Banishment */}
        <div className="summary-card">
          <h3>⚔️ 镜像身份驱逐 (已QQ通知)</h3>
          <ul className="summary-list">
            <li>
              <strong>永恒者驱逐目标：</strong>
              <span>{eternalBanishTarget}</span>
            </li>
            <li>
              <strong>凝聚者驱逐目标：</strong>
              <span>{coalescerBanishTarget}</span>
            </li>
          </ul>
        </div>

        {/* Selected Roles & Scopes */}
        <div className="summary-card">
          <h3>📜 选定身份与划定范围</h3>
          <ul className="summary-list">
            <li>
              <strong>永恒者包含身份：</strong>
              <div className="drawn-tags">
                {eternalSelectedRoles.map((r, i) => (
                  <span key={i} className="drawn-tag eternal">
                    {r}
                  </span>
                ))}
              </div>
            </li>
            <li style={{ marginTop: '8px' }}>
              <strong>永恒者划定范围 ({eternal12Scope.length}人)：</strong>
              <span>{eternal12Scope.join(', ')}</span>
            </li>
            <li style={{ marginTop: '12px' }}>
              <strong>凝聚者包含身份：</strong>
              <div className="drawn-tags">
                {coalescerSelectedRoles.map((r, i) => (
                  <span key={i} className="drawn-tag coalescer">
                    {r}
                  </span>
                ))}
              </div>
            </li>
            <li style={{ marginTop: '8px' }}>
              <strong>凝聚者划定范围 ({coalescer12Scope.length}人)：</strong>
              <span>{coalescer12Scope.join(', ')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Full Allocations Display */}
      {finalAllocations && (
        <div className="step-section">
          <h3 className="section-title">👥 全图四大阵营马甲与身份完整分配表</h3>
          <div className="allocations-overview-grid">
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
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="btn secondary-btn" onClick={onRestart}>
          🏠 返回主页 / 创建新游戏
        </button>
        <button type="button" className="btn primary-btn" onClick={handleCopyReport}>
          {copied ? '✓ 已复制完整报告到剪贴板！' : '📋 复制完整对局配置报告'}
        </button>
      </div>
    </div>
  )
}
