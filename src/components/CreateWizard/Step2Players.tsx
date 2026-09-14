import React, { useState } from 'react'
import type { PlayerPair } from '../../types/game'

interface Step2Props {
  totalRequired: number
  playerPairs: PlayerPair[]
  onSavePairs: (pairs: PlayerPair[]) => void
  onNext: () => void
  onPrev: () => void
}

export const Step2Players: React.FC<Step2Props> = ({
  totalRequired,
  playerPairs,
  onSavePairs,
  onNext,
  onPrev,
}) => {
  // Initialize text area state from playerPairs or empty
  const initialPlayersText = playerPairs.map((p) => p.player).join('\n')
  const initialAliasesText = playerPairs.map((p) => p.alias).join('\n')

  const [playersText, setPlayersText] = useState<string>(initialPlayersText)
  const [aliasesText, setAliasesText] = useState<string>(initialAliasesText)

  // Parse lines (filtering out empty whitespace lines if needed, or keeping exact lines)
  const playersList = playersText.split('\n').map((s) => s.trim()).filter(Boolean)
  const aliasesList = aliasesText.split('\n').map((s) => s.trim()).filter(Boolean)

  const playersCount = playersList.length
  const aliasesCount = aliasesList.length

  const isCountEqual = playersCount === aliasesCount
  const isTotalMatches = playersCount === totalRequired
  const isValid = isCountEqual && isTotalMatches && totalRequired > 0

  // Combine into pairs whenever valid or for preview
  const currentPairsCount = Math.max(playersList.length, aliasesList.length)
  const previewPairs: PlayerPair[] = []
  for (let i = 0; i < currentPairsCount; i++) {
    previewPairs.push({
      id: i + 1,
      player: playersList[i] || '',
      alias: aliasesList[i] || '',
    })
  }

  const handleNextClick = () => {
    if (!isValid) return
    const validPairs: PlayerPair[] = playersList.map((p, idx) => ({
      id: idx + 1,
      player: p,
      alias: aliasesList[idx],
    }))
    onSavePairs(validPairs)
    onNext()
  }

  // Helper function to fill sample data matching totalRequired
  const handleFillSample = () => {
    const samplePlayers: string[] = []
    const sampleAliases: string[] = []
    for (let i = 1; i <= totalRequired; i++) {
      samplePlayers.push(`玩家${i}`)
      sampleAliases.push(`马甲${String.fromCharCode(64 + i > 90 ? 90 : 64 + i)}${i}`)
    }
    setPlayersText(samplePlayers.join('\n'))
    setAliasesText(sampleAliases.join('\n'))
  }

  return (
    <div className="wizard-step-container">
      <div className="step-header">
        <h2 className="step-title">第二步：复制玩家和马甲列表</h2>
        <p className="step-subtitle">
          请分别在左右两侧文本框输入或粘贴真实玩家名与对应的马甲。每一行代表一名角色，按行对应。
        </p>
      </div>

      <div className="step-info-bar">
        <span>当前需要总人数：<strong>{totalRequired}</strong> 人</span>
        <button type="button" className="sample-btn" onClick={handleFillSample}>
          🪄 快速填入示例数据
        </button>
      </div>

      <div className="textareas-row">
        {/* Left Textarea: Players */}
        <div className="textarea-group">
          <div className="textarea-header">
            <label className="textarea-label">左侧：真实玩家列表 (一人一行)</label>
            <span className={`count-badge ${playersCount === totalRequired ? 'success' : 'warn'}`}>
              已输入 {playersCount} / {totalRequired}
            </span>
          </div>
          <textarea
            className="code-textarea"
            rows={12}
            placeholder={`玩家A\n玩家B\n玩家C\n玩家D`}
            value={playersText}
            onChange={(e) => setPlayersText(e.target.value)}
          />
        </div>

        {/* Right Textarea: Aliases */}
        <div className="textarea-group">
          <div className="textarea-header">
            <label className="textarea-label">右侧：对应马甲列表 (一人一行)</label>
            <span className={`count-badge ${aliasesCount === totalRequired ? 'success' : 'warn'}`}>
              已输入 {aliasesCount} / {totalRequired}
            </span>
          </div>
          <textarea
            className="code-textarea"
            rows={12}
            placeholder={`马甲E\n马甲F\n马甲G\n马甲H`}
            value={aliasesText}
            onChange={(e) => setAliasesText(e.target.value)}
          />
        </div>
      </div>

      {/* Validation Banner */}
      {!isValid && (
        <div className="validation-banner error">
          <span className="banner-icon">⚠️</span>
          <div className="banner-text">
            {!isCountEqual && (
              <p>• 玩家数量 ({playersCount}) 与马甲数量 ({aliasesCount}) 必须完全一致。</p>
            )}
            {!isTotalMatches && (
              <p>• 总人数 ({playersCount}) 必须等于第一步设定的四大阵营总人数 ({totalRequired})。</p>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Pairs Mapping Preview */}
      {previewPairs.length > 0 && (
        <div className="step-section">
          <h3 className="section-title">马甲列表与绑定状态预览</h3>
          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>序号</th>
                  <th>对应马甲名称</th>
                  <th>绑定期望状态</th>
                </tr>
              </thead>
              <tbody>
                {previewPairs.map((pair) => {
                  const isPairValid = Boolean(pair.player && pair.alias)
                  return (
                    <tr key={pair.id} className={!isPairValid ? 'row-invalid' : ''}>
                      <td>{pair.id}</td>
                      <td>{pair.alias || <span className="text-muted">(空)</span>}</td>
                      <td>
                        {isPairValid ? (
                          <span className="status-tag success">已建立对应绑定</span>
                        ) : (
                          <span className="status-tag danger">缺失对应信息</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="btn secondary-btn" onClick={onPrev}>
          ← 上一步
        </button>
        <button
          type="button"
          className="btn primary-btn"
          disabled={!isValid}
          onClick={handleNextClick}
        >
          下一步：核心身份分发与初始启动 →
        </button>
      </div>
    </div>
  )
}
