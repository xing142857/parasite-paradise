import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rules from './content/game-rules.md?raw'
import './App.css'

function App() {
  return (
    <main className="rules-page">
      <article className="rules-document">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{rules}</ReactMarkdown>
      </article>
    </main>
  )
}

export default App
