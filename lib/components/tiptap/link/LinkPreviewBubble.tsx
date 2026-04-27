import * as React from 'react'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { Editor } from '@tiptap/core'

const subscribe = (cb: () => void) => {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}
const getSnapshot = () => window.innerWidth

interface LinkPreviewBubbleProps {
  editor: Editor
  href: string
  onChange: () => void
}

export const LinkPreviewBubble = ({
  editor,
  href,
  onChange,
}: LinkPreviewBubbleProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const windowWidth = useSyncExternalStore(subscribe, getSnapshot, () => 450)
  const isSmallScreen = windowWidth < 450
  const displayHref =
    isSmallScreen && href.length > 15 ? href.slice(0, 15) : href

  const handleChange = () => {
    // Select the full link text so setLink applies to it
    const { $from } = editor.state.selection
    const linkMark = $from.marks().find((m) => m.type.name === 'link')
    if (linkMark) {
      let from = $from.pos
      let to = $from.pos
      // Walk backwards to find link start
      editor.state.doc.nodesBetween($from.start(), $from.pos, (node, pos) => {
        if (node.isText && linkMark.isInSet(node.marks)) {
          from = pos
        }
      })
      // Walk forwards to find link end
      editor.state.doc.nodesBetween($from.pos, $from.end(), (node, pos) => {
        if (node.isText && linkMark.isInSet(node.marks)) {
          to = pos + node.nodeSize
        }
      })
      editor.chain().focus().setTextSelection({ from, to }).run()
    }

    onChange()
  }

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run()
  }

  // Nudge the popup left if it overflows the viewport.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const reposition = () => {
      el.style.marginLeft = '0px'

      const rect = el.getBoundingClientRect()
      const overflow = rect.right - window.innerWidth + 8
      if (overflow > 0) {
        el.style.marginLeft = `-${overflow}px`
      }
    }

    const timer = setTimeout(reposition, 10)
    window.addEventListener('resize', reposition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', reposition)
    }
  }, [href])

  return (
    <div
      ref={containerRef}
      className='flex w-max items-center gap-3 rounded-md border border-[#DFE1E4] bg-white px-3 py-2 shadow-md'
    >
      <span className='flex items-center gap-2'>
        {!isSmallScreen && (
          <p className='m-0 whitespace-nowrap text-sm font-normal leading-normal text-[#212B36]'>
            Go to link:
          </p>
        )}
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={href}
          className='max-w-48 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-[#1164A3] hover:underline'
        >
          {displayHref}
        </a>
      </span>
      <div className='h-4 w-px shrink-0 bg-gray-300' />
      <button
        type='button'
        onClick={handleChange}
        className='shrink-0 cursor-pointer rounded border border-solid border-transparent bg-transparent px-3 py-1 hover:bg-[#F8F9FB]'
      >
        <p className='m-0 text-sm font-medium leading-none text-[#212B36]'>
          Change
        </p>
      </button>
      <div className='h-4 w-px shrink-0 bg-gray-300' />
      <button
        type='button'
        onClick={handleRemove}
        className='shrink-0 cursor-pointer rounded border border-solid border-transparent bg-transparent px-3 py-1 hover:bg-[#F8F9FB]'
      >
        <p className='m-0 text-sm font-medium leading-none text-[#212B36]'>
          Remove
        </p>
      </button>
    </div>
  )
}

export default LinkPreviewBubble
