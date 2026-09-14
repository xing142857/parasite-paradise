import ReactMarkdown from 'react-markdown'
import rules from './content/game-rules.md?raw'
import './App.css'

function App() {
  return (
    <main className="rules-page">
      <article className="rules-document">
        <ReactMarkdown>{rules}</ReactMarkdown>
      </article>
    </main>
  )
}

export default App
