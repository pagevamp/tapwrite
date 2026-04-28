import * as React from 'react'
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Editor } from '@tiptap/core'
import { LinkIconSDS, TextIconSDS } from './../../../icons'
import { selectionHighlightKey } from './linkExt'

const ensureHttps = (url: string): string => {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  if (/^mailto:/i.test(url)) return url
  if (/^tel:/i.test(url)) return url
  return `https://${url}`
}

interface LinkBubbleInputProps {
  editor: Editor
  showLinkInput: boolean
  setShowLinkInput: (show: boolean) => void
  hasTextSelection: boolean
  editHref: string | null
  setEditHref: (href: string | null) => void
}

export const LinkBubbleInput = ({
  editor,
  showLinkInput,
  setShowLinkInput,
  hasTextSelection,
  editHref,
  setEditHref,
}: LinkBubbleInputProps) => {
  const [displayText, setDisplayText] = useState('')
  const [url, setUrl] = useState('')
  const textInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    editor.view.dispatch(
      editor.state.tr.setMeta(selectionHighlightKey, null)
    )
    setDisplayText('')
    setUrl('')
    setEditHref(null)
    setShowLinkInput(false)
  }, [editor, setShowLinkInput, setEditHref])

  // Pre-fill URL when editing an existing link
  useEffect(() => {
    if (showLinkInput && editHref) {
      setUrl(editHref)
    }
  }, [showLinkInput, editHref])

  const handleSubmit = () => {
    if (!url.trim()) return

    const href = ensureHttps(url.trim())

    if (editHref) {
      // Editing an existing link — extendMarkRange covers the full link
      // mark even if the selection has collapsed since the popover opened.
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    } else if (hasTextSelection) {
      editor.chain().focus().setLink({ href }).run()
    } else {
      const text = displayText.trim() || href
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href } }],
          text,
        })
        .run()
    }

    handleClose()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      handleClose()
      return
    }

    if (event.key === 'Enter') {
      // Stop the native Enter from reaching window-level listeners
      // in host apps (e.g. submit-on-Enter in a comment form) — the
      // link input has handled the keypress.
      event.preventDefault()
      event.stopPropagation()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (!showLinkInput) return

    const timer = setTimeout(() => {
      if (hasTextSelection) {
        const { from, to } = editor.state.selection
        if (from !== to) {
          editor.view.dispatch(
            editor.state.tr.setMeta(selectionHighlightKey, { from, to })
          )
        }
        urlInputRef.current?.focus()
      } else {
        textInputRef.current?.focus()
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [showLinkInput, hasTextSelection, editor])

  // Close when user clicks outside the popup (including into the editor)
  useEffect(() => {
    if (!showLinkInput) return

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      handleClose()
    }

    // Delay listener so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [showLinkInput, handleClose])

  return (
    <div
      ref={containerRef}
      className='flex items-center gap-2 rounded-lg border border-[#DFE1E4] bg-white p-2 shadow-md'
    >
      <div className='flex flex-col gap-2'>
        {!hasTextSelection && (
          <div className='flex items-center gap-1 rounded border border-[#DFE1E4] px-2 py-1'>
            <span className='shrink-0 text-[#6B6F76]'>
              <TextIconSDS />
            </span>
            <input
              ref={textInputRef}
              type='text'
              placeholder='Text to display'
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              onKeyDown={handleKeyDown}
              className='w-52 text-xs leading-5 font-normal bg-transparent focus:outline-none'
            />
          </div>
        )}
        <div className='flex items-center gap-1 rounded border border-[#DFE1E4] px-2 py-1'>
          <span className='shrink-0 text-[#6B6F76]'>
            <LinkIconSDS />
          </span>
          <input
            ref={urlInputRef}
            type='text'
            placeholder='Type or paste a link'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className='w-52 text-xs leading-5 font-normal bg-transparent focus:outline-none'
          />
        </div>
      </div>
      <button
        type='button'
        onClick={handleSubmit}
        disabled={!url.trim()}
        className='shrink-0 rounded px-3 py-1 font-medium text-sm text-[#212B36] hover:bg-[#F8F9FB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        {editHref ? 'Save' : 'Add'}
      </button>
    </div>
  )
}

export default LinkBubbleInput
