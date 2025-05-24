import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import MentionList from './MentionList.jsx'
import { appStore } from '../../../../app/stores/appStore.js'
import { useDebouncedCallback } from 'use-debounce'
import { useState } from 'react'
import { queryData } from '../../../../app/lib/search.js'
import { getOrInitLibraryYTree } from '../../../../app/lib/ytree.js'

export default {
  items: ({ query }) => {
    const libraryId = appStore.getState().libraryId

    const searchResults = queryData(query).filter(
      (result) => (result.libraryId === libraryId));

    const resultItems = searchResults.map((result) => result.id);

    return resultItems;
  },

  render: () => {
    let component
    let popup

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}