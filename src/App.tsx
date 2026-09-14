import { useState } from 'react'
import { RulesModal } from './components/RulesModal'
import { HomeView } from './components/HomeView'
import { Step1Factions } from './components/CreateWizard/Step1Factions'
import { Step2Players } from './components/CreateWizard/Step2Players'
import { Step3Setup } from './components/CreateWizard/Step3Setup'
import { GameSummary } from './components/CreateWizard/GameSummary'
import type { InitialSetupData, FactionCounts, SpecialRoles, PlayerPair } from './types/game'
import './App.css'

type ViewMode = 'home' | 'step1' | 'step2' | 'step3' | 'summary'

const defaultSetupData: InitialSetupData = {
  factionCounts: {
    eternal: 9,
    coalescer: 9,
    deceiver: 3,
    adapter: 5,
  },
  initialPromotedCount: 1,
  customScopeSize: 12,
  specialRoles: {
    inquisitor: false,
    arbiter: false,
  },
  playerPairs: [],
  coreRoles: {
    eternal: null,
    coalescer: null,
    deceiver: null,
  },
  eternalBanishTarget: '',
  eternalBanishNotified: false,
  coalescerBanishTarget: '',
  coalescerBanishNotified: false,
  eternalSelectedRoles: [],
  coalescerSelectedRoles: [],
  eternal12Scope: [],
  eternalDrawnMembers: [],
  coalescer12Scope: [],
  coalescerDrawnMembers: [],
  finalAllocations: null,
}

export default function App() {
  const [view, setView] = useState<ViewMode>('home')
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [setupData, setSetupData] = useState<InitialSetupData>(defaultSetupData)

  const handleStartCreate = () => {
    setView('step1')
  }

  const handleRestart = () => {
    setSetupData(defaultSetupData)
    setView('home')
  }

  // Calculate total players required from step 1
  const totalRequired =
    setupData.factionCounts.eternal +
    setupData.factionCounts.coalescer +
    setupData.factionCounts.deceiver +
    setupData.factionCounts.adapter

  return (
    <div className="app-layout">
      {/* Rules Button & Fullscreen Modal (Visible on any page) */}
      <RulesModal
        isOpen={isRulesOpen}
        onOpen={() => setIsRulesOpen(true)}
        onClose={() => setIsRulesOpen(false)}
      />

      <header className="app-header">

        {/* Wizard Steps Indicator Header */}
        {(view === 'step1' || view === 'step2' || view === 'step3') && (
          <div className="wizard-progress-bar">
            <div
              className={`progress-step ${view === 'step1' ? 'active' : ''} ${
                view === 'step2' || view === 'step3' ? 'completed' : ''
              }`}
              onClick={() => setView('step1')}
            >
              <span className="step-number">1</span>
              <span className="step-label">四大阵营与附加身份</span>
            </div>
            <div className="step-connector"></div>
            <div
              className={`progress-step ${view === 'step2' ? 'active' : ''} ${
                view === 'step3' ? 'completed' : ''
              }`}
              onClick={() => {
                if (view === 'step3') setView('step2')
              }}
            >
              <span className="step-number">2</span>
              <span className="step-label">复制玩家与马甲</span>
            </div>
            <div className="step-connector"></div>
            <div className={`progress-step ${view === 'step3' ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">核心身份与初始启动</span>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        {view === 'home' && <HomeView onStartCreate={handleStartCreate} />}

        {view === 'step1' && (
          <Step1Factions
            factionCounts={setupData.factionCounts}
            onChangeFactionCounts={(counts: FactionCounts) =>
              setSetupData((prev) => ({ ...prev, factionCounts: counts }))
            }
            initialPromotedCount={setupData.initialPromotedCount}
            onChangeInitialPromotedCount={(count: number) =>
              setSetupData((prev) => ({ ...prev, initialPromotedCount: count }))
            }
            specialRoles={setupData.specialRoles}
            onChangeSpecialRoles={(roles: SpecialRoles) =>
              setSetupData((prev) => ({ ...prev, specialRoles: roles }))
            }
            onNext={() => setView('step2')}
            onCancel={() => setView('home')}
          />
        )}

        {view === 'step2' && (
          <Step2Players
            totalRequired={totalRequired}
            playerPairs={setupData.playerPairs}
            onSavePairs={(pairs: PlayerPair[]) =>
              setSetupData((prev) => ({ ...prev, playerPairs: pairs }))
            }
            onNext={() => setView('step3')}
            onPrev={() => setView('step1')}
          />
        )}

        {view === 'step3' && (
          <Step3Setup
            setupData={setupData}
            onUpdateSetupData={(updater) => setSetupData(updater)}
            onPrev={() => setView('step2')}
            onFinish={() => setView('summary')}
          />
        )}

        {view === 'summary' && (
          <GameSummary setupData={setupData} onRestart={handleRestart} />
        )}
      </main>
    </div>
  )
}

