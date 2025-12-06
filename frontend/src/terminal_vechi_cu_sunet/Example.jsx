"use client"

import { useState } from "react"
import { TerminalPopup } from "./index"

// Exemplu de utilizare
const ExampleUsage = () => {
  const [isOpen, setIsOpen] = useState(false)

  const sampleText = `> INITIALIZING TIME CAPSULE SYSTEM...
> LOADING MEMORY BANKS...
> STATUS: OK

WELCOME TO TIME CAPSULE 95
==========================

This is a retro terminal popup with typewriter effect.
Each character appears one by one with typing sounds.

You can customize:
- Text content
- Typing speed
- Sound effects
- Popup styling

Press OK to close this terminal window.`

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Terminal Popup</button>

      <TerminalPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        text={sampleText}
        speed={50} // milliseconds per character
      />
    </div>
  )
}

export default ExampleUsage
