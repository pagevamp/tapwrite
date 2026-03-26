import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Tapwrite } from '../lib/main.tsx'
import type { DynamicFieldConfig } from '../lib/main.tsx'

const FIELDS = [
  { value: '{{currentDate}}', label: 'Current Date' },
  { value: '{{currentTime}}', label: 'Current Time' },
  { value: '{{client.firstName}}', label: 'Client First Name' },
  { value: '{{client.lastName}}', label: 'Client Last Name' },
  { value: '{{client.email}}', label: 'Client Email' },
  { value: '{{company.name}}', label: 'Company Name' },
]

const App = () => {
  const [content, setContent] = useState<string>(
    '<p>Type {{ to insert a dynamic field. Try it here:</p><p></p>'
  )
  const [showResolved, setShowResolved] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)

  const [resolvedValues, setResolvedValues] = useState(() => ({
    '{{currentDate}}': new Date().toLocaleDateString(),
    '{{currentTime}}': new Date().toLocaleTimeString(),
    '{{client.firstName}}': 'John',
    '{{client.lastName}}': 'Doe',
    '{{client.email}}': 'john@example.com',
    '{{company.name}}': 'Acme Inc.',
  }))

  useEffect(() => {
    const interval = setInterval(() => {
      setResolvedValues((prev) => ({
        ...prev,
        '{{currentDate}}': new Date().toLocaleDateString(),
        '{{currentTime}}': new Date().toLocaleTimeString(),
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const dynamicFieldConfig: DynamicFieldConfig = {
    fields: FIELDS,
    resolvedValues,
    showResolved,
  }

  return (
    <div style={{ padding: '1.5em', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5em' }}>Tapwrite — Dynamic Fields Demo</h2>

      <div style={{ marginBottom: '1em' }}>
        <button
          onClick={() => setShowResolved((v) => !v)}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            cursor: 'pointer',
            background: showResolved ? '#e0f2e9' : '#fff',
          }}
        >
          {showResolved ? 'Showing resolved values' : 'Showing template pills'}
        </button>
      </div>

      <Tapwrite
        uploadFn={async () => {
          const simulateDelay = () =>
            new Promise<string>((resolve) => {
              setTimeout(() => {
                resolve('https://picsum.photos/600/400')
              }, 2000)
            })
          const url = await simulateDelay()
          return url || ''
        }}
        content={content}
        getContent={(newContent) => {
          setContent(newContent)
          console.log(newContent)
        }}
        editorClass=""
        editorRef={editRef}
        dynamicFieldConfig={dynamicFieldConfig}
      />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
