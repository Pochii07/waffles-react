import { useEffect } from 'react'
import pageMarkup from './pageMarkup.html?raw'
import { initPage } from './pageBehavior'

function App() {
  useEffect(() => {
    const cleanup = initPage()
    return cleanup
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: pageMarkup }} />
}

export default App
