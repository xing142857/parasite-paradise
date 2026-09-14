import React from 'react'

interface HomeViewProps {
  onStartCreate: () => void
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartCreate }) => {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">飞船争夺版杀管理系统</h1>
      </div>

      <div className="home-options-grid">
        {/* Left option: Create New Game */}
        <div 
          className="option-card option-create"
          onClick={onStartCreate}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartCreate()}
        >
          <div className="card-badge">推荐</div>
          <div className="card-icon">🎮</div>
          <h2 className="card-title">创建新游戏</h2>
          <p className="card-desc">
            设置阵营人数、录入玩家与马甲名单、随机发放三大核心身份，并完成永恒者与凝聚者初始启动流程。
          </p>
          <button className="card-btn primary-btn">
            开始创建流程 →
          </button>
        </div>

        {/* Right option: Load Existing Data (Disabled/Placeholder) */}
        <div className="option-card option-load disabled">
          <div className="card-badge disabled-badge">暂未开放</div>
          <div className="card-icon">📂</div>
          <h2 className="card-title">载入现有数据</h2>
          <p className="card-desc">
            从本地存档文件或导出的游戏 JSON 进度包中恢复对局记录（此功能暂未开放）。
          </p>
          <button className="card-btn disabled-btn" disabled>
            载入数据
          </button>
        </div>
      </div>
    </div>
  )
}
