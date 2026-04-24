import Link from '@tiptap/extension-link'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const selectionHighlightKey = new PluginKey('selectionHighlight')

export const LinkExt = Link.extend({
  inclusive: false,
  exitable: true,

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? []

    // Prevent browser default navigation when clicking links in the editor.
    const preventClickPlugin = new Plugin({
      key: new PluginKey('linkClickPrevention'),
      props: {
        handleClick: (view, _pos, event) => {
          const target = event.target as HTMLElement
          const link = target.closest('a')
          if (link && view.editable) {
            event.preventDefault()
            return true
          }
          return false
        },
      },
    })

    // Show a highlight decoration over the selection when the editor loses
    // focus to the link input, so the user can still see which text will
    // receive the link.
    const selectionHighlightPlugin = new Plugin({
      key: selectionHighlightKey,
      state: {
        init: () => DecorationSet.empty,
        apply: (tr, decorationSet, _oldState, newState) => {
          const meta = tr.getMeta(selectionHighlightKey) as
            | { from: number; to: number }
            | null
            | undefined
          if (meta === null) return DecorationSet.empty
          if (meta) {
            return DecorationSet.create(newState.doc, [
              Decoration.inline(meta.from, meta.to, {
                class: 'selection-highlight',
              }),
            ])
          }
          return decorationSet.map(tr.mapping, tr.doc)
        },
      },
      props: {
        decorations(state) {
          return selectionHighlightKey.getState(state)
        },
      },
    })

    return [...parentPlugins, preventClickPlugin, selectionHighlightPlugin]
  },
}).configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    class: 'tapwrite-link',
    rel: 'noopener noreferrer',
    target: '_blank',
  },
})
