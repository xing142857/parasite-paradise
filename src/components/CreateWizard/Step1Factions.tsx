import React from 'react'
import type { FactionCounts, SpecialRoles } from '../../types/game'

interface Step1Props {
  factionCounts: FactionCounts
  onChangeFactionCounts: (counts: FactionCounts) => void
  initialPromotedCount: number
  onChangeInitialPromotedCount: (count: number) => void
  specialRoles: SpecialRoles
  onChangeSpecialRoles: (roles: SpecialRoles) => void
  onNext: () => void
  onCancel: () => void
}

export const Step1Factions: React.FC<Step1Props> = ({
  factionCounts,
  onChangeFactionCounts,
  initialPromotedCount,
  onChangeInitialPromotedCount,
  specialRoles,
  onChangeSpecialRoles,
  onNext,
  onCancel,
}) => {
  const totalPlayers =
    factionCounts.eternal +
    factionCounts.coalescer +
    factionCounts.deceiver +
    factionCounts.adapter

  const isEqualMirrorFactions = factionCounts.eternal === factionCounts.coalescer

  const safeInitialPromotedCount = initialPromotedCount ?? 1

  const handleFactionChange = (key: keyof FactionCounts, val: number) => {
    const num = Math.max(0, val || 0)
    
    // 永恒者与凝聚者必须相等
    if (key === 'eternal' || key === 'coalescer') {
      onChangeFactionCounts({
        ...factionCounts,
        eternal: num,
        coalescer: num,
      })
    } else {
      const updated = {
        ...factionCounts,
        [key]: num,
      }
      onChangeFactionCounts(updated)

      // 如果适应者数量减少，调整初始晋升者数量不超过适应者总数
      if (key === 'adapter' && safeInitialPromotedCount > num) {
        onChangeInitialPromotedCount(num)
      }
    }
  }

  const handlePromotedChange = (val: number) => {
    const rawVal = typeof val === 'number' && !isNaN(val) ? val : 0
    const maxVal = Math.max(0, factionCounts.adapter || 0)
    const num = Math.max(0, Math.min(rawVal, maxVal))
    onChangeInitialPromotedCount(num)
  }

  const handleToggleSpecialRole = (key: keyof SpecialRoles) => {
    onChangeSpecialRoles({
      ...specialRoles,
      [key]: !specialRoles[key],
    })
  }

  const isValid = totalPlayers > 0 && isEqualMirrorFactions

  return (
    <div className="wizard-step-container">
      <div className="step-header">
        <h2 className="step-title">第一步：四大阵营人数与附加身份设置</h2>
        <p className="step-subtitle">
          请确认四大阵营的基础玩家分布人数，并选择是否启用审判者、仲裁者等附加身份。
        </p>
      </div>

      <div className="step-section">
        <h3 className="section-title">1. 四大阵营人数配置</h3>
        <div className="faction-grid">
          <div className="faction-card">
            <div className="faction-name">
              <span className="faction-dot eternal-dot"></span>
              永恒阵营
            </div>
            <div className="counter-control">
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('eternal', factionCounts.eternal - 1)}
              >
                -
              </button>
              <input
                type="number"
                className="counter-input"
                min="0"
                value={factionCounts.eternal}
                onChange={(e) => handleFactionChange('eternal', parseInt(e.target.value) || 0)}
              />
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('eternal', factionCounts.eternal + 1)}
              >
                +
              </button>
            </div>
            <div className="faction-tip">
              *与凝聚者人数保持自动联动（必须相等）
            </div>
          </div>

          <div className="faction-card">
            <div className="faction-name">
              <span className="faction-dot coalescer-dot"></span>
              凝聚阵营
            </div>
            <div className="counter-control">
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('coalescer', factionCounts.coalescer - 1)}
              >
                -
              </button>
              <input
                type="number"
                className="counter-input"
                min="0"
                value={factionCounts.coalescer}
                onChange={(e) => handleFactionChange('coalescer', parseInt(e.target.value) || 0)}
              />
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('coalescer', factionCounts.coalescer + 1)}
              >
                +
              </button>
            </div>
            <div className="faction-tip">
              *与永恒者人数保持自动联动（必须相等）
            </div>
          </div>

          <div className="faction-card">
            <div className="faction-name">
              <span className="faction-dot deceiver-dot"></span>
              欺骗阵营
            </div>
            <div className="counter-control">
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('deceiver', factionCounts.deceiver - 1)}
              >
                -
              </button>
              <input
                type="number"
                className="counter-input"
                min="0"
                value={factionCounts.deceiver}
                onChange={(e) => handleFactionChange('deceiver', parseInt(e.target.value) || 0)}
              />
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('deceiver', factionCounts.deceiver + 1)}
              >
                +
              </button>
            </div>
            {factionCounts.deceiver > 1 && (
              <div className="faction-notice warn-notice">
                💡 包含 <strong>{factionCounts.deceiver - 1}</strong> 个初始追随者
              </div>
            )}
          </div>

          <div className="faction-card">
            <div className="faction-name">
              <span className="faction-dot adapter-dot"></span>
              适应阵营
            </div>
            <div className="counter-control">
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('adapter', factionCounts.adapter - 1)}
              >
                -
              </button>
              <input
                type="number"
                className="counter-input"
                min="0"
                value={factionCounts.adapter}
                onChange={(e) => handleFactionChange('adapter', parseInt(e.target.value) || 0)}
              />
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleFactionChange('adapter', factionCounts.adapter + 1)}
              >
                +
              </button>
            </div>

            {/* Sub-option: Initial Promoted Count */}
            <div className="sub-option-box">
              <div className="sub-option-label">
                初始晋升者数量：
              </div>
              <div className="counter-control small">
                <button
                  type="button"
                  className="counter-btn small"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePromotedChange(safeInitialPromotedCount - 1)
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  className="counter-input small"
                  min="0"
                  max={factionCounts.adapter}
                  value={safeInitialPromotedCount}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10)
                    handlePromotedChange(isNaN(parsed) ? 0 : parsed)
                  }}
                />
                <button
                  type="button"
                  className="counter-btn small"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePromotedChange(safeInitialPromotedCount + 1)
                  }}
                >
                  +
                </button>
              </div>
              <span className="sub-option-hint">
                (开局在升华者、凝滞者、幻化者中随机生成)
              </span>
            </div>
          </div>
        </div>

        <div className="total-players-banner">
          <span className="banner-label">四大阵营总人数：</span>
          <span className="banner-count">{totalPlayers}</span> 人
          {!isEqualMirrorFactions && (
            <span className="banner-error"> (⚠️ 永恒者与凝聚者人数必须相等)</span>
          )}
        </div>
      </div>

      <div className="step-section">
        <h3 className="section-title">2. 附加身份确定</h3>
        <div className="special-roles-options">
          <label className={`special-role-card ${specialRoles.inquisitor ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={specialRoles.inquisitor}
              onChange={() => handleToggleSpecialRole('inquisitor')}
            />
            <div className="role-info">
              <div className="role-title">审判者</div>
              <div className="role-desc">
                前一日非审判致死的第一个死者指定。可发动技能【复仇审判】，公决处死目标。
              </div>
            </div>
          </label>

          <label className={`special-role-card ${specialRoles.arbiter ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={specialRoles.arbiter}
              onChange={() => handleToggleSpecialRole('arbiter')}
            />
            <div className="role-info">
              <div className="role-title">仲裁者</div>
              <div className="role-desc">
                前一日放弃所有技能申请。可发动技能【光辉仲裁】，保护相连目标不受能力技能影响。
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn secondary-btn" onClick={onCancel}>
          返回主页
        </button>
        <button
          type="button"
          className="btn primary-btn"
          disabled={!isValid}
          onClick={onNext}
        >
          下一步：录入玩家与马甲 →
        </button>
      </div>
    </div>
  )
}
