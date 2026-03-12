# Frontend Testing Plan

## Project Overview
**Te Form Sucks** - A Next.js-based Japanese conjugation quiz application for students to practice verb and adjective conjugations.

**Tech Stack:**
- Next.js 16.1.6
- React 19.2.3
- TypeScript
- Tailwind CSS
- Vitest + React Testing Library (already configured)

---

## Testing Strategy

### 1. Unit Tests
Test individual components and utility functions in isolation.

### 2. Integration Tests
Test component interactions and user flows.

### 3. E2E Tests (Optional)
Test complete user journeys across pages (if using Playwright/Cypress).

---

## Test Coverage Areas

### A. Core Components

#### 1. **Home Page (`app/page.tsx`)**
**Test Cases:**
- ✅ Renders hero section with title "te form sucks" (with strikethrough)
- ✅ Displays "click to start" button
- ✅ Clicking "click to start" transitions to quiz section
- ✅ Back button appears when in quiz section
- ✅ Back button navigates back to hero section
- ✅ Header displays SoundToggle and ThemeToggle
- ✅ Footer links (GitHub, Discord) display on hero section only
- ✅ Footer links hidden when in quiz section
- ✅ Swipe sound plays on section transition (when not muted)
- ✅ Swipe sound does not play when muted
- ✅ Smooth CSS transitions between hero and quiz sections
- ✅ Dot grid background animates correctly on section change

#### 2. **Quiz Hub (`components/quiz/quiz-hub.tsx`)**
**Test Cases:**
- ✅ Renders preset quiz sections (Verb Conjugation, Adjective Conjugation, Type Identification)
- ✅ Displays correct number of preset cards per section
- ✅ Each preset card shows title, description, and badges
- ✅ "Start" button links to correct quiz URL with preset ID
- ✅ Active preset is visually highlighted
- ✅ Custom Quiz section renders with all toggle groups
- ✅ Word groups toggle (Verbs/Adjectives) works correctly
- ✅ Verb types toggle (u-verb, ru-verb, irregular) works correctly
- ✅ Adjective types toggle (i-adj, na-adj) works correctly
- ✅ Verb targets toggle (ます, ました, て, etc.) works correctly
- ✅ Adjective targets toggle (です, でした, て, type) works correctly
- ✅ Question types toggle (Multiple choice, Fill blank, Typing) works correctly
- ✅ "Save Custom Quiz" button disabled when config invalid
- ✅ "Start Custom Quiz" button disabled when config invalid
- ✅ Validation message displays when config invalid
- ✅ Custom config saves to localStorage on "Save Custom Quiz"
- ✅ Custom config loads from localStorage on page load
- ✅ Card animations trigger when `isQuizVisible` changes
- ✅ Staggered animation delays work correctly

#### 3. **Quiz Session (`components/quiz/quiz-session.tsx`)**
**Test Cases:**
- ✅ Renders quiz title and description from config
- ✅ Generates question from valid config
- ✅ Displays "no valid questions" message for invalid config
- ✅ Shows word meaning and kana correctly
- ✅ Displays target badge (ます, て, etc.)
- ✅ Displays type badge (u-verb, ru-verb, etc.)

**Multiple Choice Mode:**
- ✅ Renders 4 choice buttons
- ✅ Choices are randomized
- ✅ Clicking correct choice sets status to "correct"
- ✅ Clicking incorrect choice sets status to "incorrect"
- ✅ Correct choice highlighted in green when answered incorrectly
- ✅ Selected incorrect choice highlighted in red
- ✅ Selected correct choice highlighted in green
- ✅ "Correct before continue" checkbox toggles requireCorrection
- ✅ When requireCorrection enabled and answer wrong, shows correction input
- ✅ Correction input focuses automatically
- ✅ Typing correct answer in correction input accepts it
- ✅ Typing incorrect answer in correction input shows error
- ✅ "Skip" button resets to new question
- ✅ Correct audio plays on correct answer (when not muted)
- ✅ Wrong audio plays on incorrect answer (when not muted)
- ✅ No audio plays when muted

**Fill Blank Mode:**
- ✅ Displays fill-in prompt with word and target
- ✅ Input field accepts user typing
- ✅ Enter key submits answer
- ✅ "Check" button submits answer
- ✅ Correct answer shows success feedback
- ✅ Incorrect answer shows error feedback
- ✅ Correct answer displays after checking
- ✅ Input disabled after correct answer
- ✅ "Next" button appears after correct answer
- ✅ "Next" button resets to new question
- ✅ "Skip" button resets to new question
- ✅ "Correct before continue" checkbox works
- ✅ Keyboard shortcut (any key) advances after answer

**Typing Mode:**
- ✅ Input field accepts user typing
- ✅ Enter key submits answer
- ✅ "Check" button submits answer
- ✅ Answer normalization handles variations (hiragana/katakana, spaces)
- ✅ Correct answer shows success feedback
- ✅ Incorrect answer shows error feedback
- ✅ Correct answer displays after checking
- ✅ Input disabled after correct answer
- ✅ "Next" button appears after correct answer
- ✅ Keyboard shortcut (any key) advances after answer

**General Quiz Session:**
- ✅ Question regenerates on config change
- ✅ Status resets to "idle" on new question
- ✅ Input value clears on new question
- ✅ Feedback message displays correctly for correct/incorrect
- ✅ Link to cheat sheet appears on incorrect answer
- ✅ Home button appears in feedback section
- ✅ Audio preloading works correctly
- ✅ Audio priming on user interaction works
- ✅ Swipe sound plays on question change (when not muted)

#### 4. **Quiz Page Client (`components/quiz/quiz-page-client.tsx`)**
**Test Cases:**
- ✅ Loads preset config from URL query param `preset`
- ✅ Loads custom config when `custom=1` query param present
- ✅ Custom config loads from localStorage
- ✅ Falls back to default config if preset not found
- ✅ Falls back to default config if localStorage invalid
- ✅ Updates config when query params change
- ✅ Renders header with Home, SoundToggle, Cheat sheet link, ThemeToggle
- ✅ Home button links to "/"
- ✅ Cheat sheet button links to "/cheatsheet"
- ✅ Renders QuizSession with correct config
- ✅ Dot grid background displays

#### 5. **Sound Toggle (`components/sound-toggle.tsx`)**
**Test Cases:**
- ✅ Renders mute/unmute button
- ✅ Displays VolumeX icon when muted
- ✅ Displays Volume2 icon when unmuted
- ✅ Clicking toggles mute state
- ✅ Mute state persists in localStorage
- ✅ Mute state loads from localStorage on mount
- ✅ Calls `onToggle` callback when provided
- ✅ Displays correct aria-label for accessibility

#### 6. **Theme Toggle (`components/theme-toggle.tsx`)**
**Test Cases:**
- ✅ Renders theme toggle button
- ✅ Displays Moon icon in light mode
- ✅ Displays Sun icon in dark mode
- ✅ Clicking toggles theme
- ✅ Theme persists in localStorage
- ✅ Theme loads from localStorage on mount
- ✅ Adds "dark" class to document root in dark mode
- ✅ Removes "dark" class from document root in light mode
- ✅ Defaults to light theme if no stored preference
- ✅ Displays correct aria-label for accessibility

#### 7. **Cheat Sheet Page (`app/cheatsheet/page.tsx`)**
**Test Cases:**
- ✅ Renders page title "Conjugation guide"
- ✅ Displays legend badges (Ru-verb, U-verb, Irregular, I-adj, Na-adj)
- ✅ Renders "How to identify verb types" card
- ✅ Renders "Verb polite forms" card with examples
- ✅ Renders "Te-form rules for verbs" card
- ✅ Renders "Adjective types" card
- ✅ Renders "Adjective polite + linking" card
- ✅ "Back to quiz" link navigates to "/"
- ✅ All conjugation examples display correctly
- ✅ Responsive layout works on mobile/tablet/desktop

### B. UI Components

#### 8. **Button Component (`components/ui/button.tsx`)**
**Test Cases:**
- ✅ Renders with default variant
- ✅ Renders with outline variant
- ✅ Renders with ghost variant
- ✅ Renders with secondary variant
- ✅ Renders with correct size (sm, md, lg)
- ✅ Handles onClick events
- ✅ Disabled state prevents clicks
- ✅ Renders as Link when `asChild` prop used
- ✅ Applies correct className variants

#### 9. **Card Components (`components/ui/card.tsx`)**
**Test Cases:**
- ✅ Card renders with correct structure
- ✅ CardHeader renders title and description
- ✅ CardContent renders children
- ✅ Applies correct styling classes

#### 10. **Input Component (`components/ui/input.tsx`)**
**Test Cases:**
- ✅ Renders input field
- ✅ Handles value changes
- ✅ Handles onKeyDown events
- ✅ Disabled state prevents input
- ✅ Applies correct className variants
- ✅ Ref forwarding works correctly

#### 11. **Badge Component (`components/ui/badge.tsx`)**
**Test Cases:**
- ✅ Renders with default variant
- ✅ Renders with secondary variant
- ✅ Renders with outline variant
- ✅ Displays text content correctly

### C. Utility Functions

#### 12. **Quiz Configuration (`lib/quiz/config.ts`)**
**Test Cases:**
- ✅ `getPresetById` returns correct preset
- ✅ `getPresetById` returns null for invalid ID
- ✅ `defaultCustomConfig` has correct structure
- ✅ Presets array contains expected presets
- ✅ Config validation logic works correctly

#### 13. **Conjugation Logic (`lib/quiz/conjugation.ts`)**
**Test Cases:**
- ✅ `getAnswer` returns correct conjugation for verbs
- ✅ `getAnswer` returns correct conjugation for adjectives
- ✅ `getAcceptedAnswers` returns array of valid answers
- ✅ `normalizeAnswer` normalizes hiragana/katakana
- ✅ `normalizeAnswer` handles spaces and case
- ✅ `getTargetLabel` returns correct label
- ✅ `getTypeLabel` returns correct type label

#### 14. **Sound Utilities (`lib/sound.ts`)**
**Test Cases:**
- ✅ `getSoundMuted` returns boolean from localStorage
- ✅ `setSoundMuted` saves to localStorage
- ✅ `SOUND_MUTED_EVENT` constant is correct
- ✅ Event dispatching works correctly

### D. User Flows

#### 15. **Complete Quiz Flow**
**Test Cases:**
- ✅ User navigates from hero to quiz section
- ✅ User selects a preset quiz
- ✅ User answers multiple questions correctly
- ✅ User answers incorrectly and sees feedback
- ✅ User skips questions
- ✅ User enables "correct before continue" and must correct mistakes
- ✅ User navigates to cheat sheet from quiz
- ✅ User returns from cheat sheet to quiz
- ✅ User creates custom quiz configuration
- ✅ User starts custom quiz
- ✅ User toggles sound on/off during quiz
- ✅ User toggles theme during quiz
- ✅ User uses keyboard shortcuts to advance

#### 16. **Navigation Flow**
**Test Cases:**
- ✅ Navigation between home, quiz, and cheat sheet pages
- ✅ Browser back button works correctly
- ✅ Direct URL navigation works (e.g., `/quiz?preset=verb-masu`)
- ✅ Query parameters persist correctly
- ✅ Custom quiz loads from localStorage on direct navigation

#### 17. **Accessibility**
**Test Cases:**
- ✅ All interactive elements have aria-labels
- ✅ Keyboard navigation works throughout app
- ✅ Focus management works correctly
- ✅ Screen reader announcements for quiz feedback
- ✅ Color contrast meets WCAG standards
- ✅ Form inputs have proper labels

### E. Edge Cases & Error Handling

#### 18. **Error Scenarios**
**Test Cases:**
- ✅ Invalid quiz config shows error message
- ✅ Missing localStorage data handled gracefully
- ✅ Corrupted localStorage data handled gracefully
- ✅ Invalid URL query params handled gracefully
- ✅ Audio playback errors don't break app
- ✅ Empty word lists handled correctly
- ✅ No valid questions generated shows message

#### 19. **Browser Compatibility**
**Test Cases:**
- ✅ localStorage API works correctly
- ✅ Audio API works correctly
- ✅ CSS transitions work correctly
- ✅ Event listeners clean up properly
- ✅ Memory leaks prevented (refs, event listeners)

### F. Performance

#### 20. **Performance Tests**
**Test Cases:**
- ✅ Question generation is fast (<100ms)
- ✅ Component re-renders are optimized
- ✅ Audio files preload correctly
- ✅ Large word lists don't cause lag
- ✅ Smooth animations (60fps)

---

## Test File Structure

```
__tests__/
├── components/
│   ├── quiz/
│   │   ├── quiz-hub.test.tsx
│   │   ├── quiz-session.test.tsx
│   │   └── quiz-page-client.test.tsx
│   ├── sound-toggle.test.tsx
│   ├── theme-toggle.test.tsx
│   └── ui/
│       ├── button.test.tsx
│       ├── card.test.tsx
│       ├── input.test.tsx
│       └── badge.test.tsx
├── app/
│   ├── page.test.tsx
│   ├── quiz/
│   │   └── page.test.tsx
│   └── cheatsheet/
│       └── page.test.tsx
├── lib/
│   ├── quiz/
│   │   ├── config.test.ts
│   │   └── conjugation.test.ts
│   └── sound.test.ts
└── __mocks__/
    ├── next/
    │   ├── navigation.ts
    │   └── link.tsx
    └── audio.ts
```

---

## Testing Tools & Setup

### Already Configured:
- ✅ Vitest
- ✅ React Testing Library
- ✅ @testing-library/jest-dom
- ✅ @testing-library/user-event
- ✅ jsdom

### Recommended Additional Setup:
- Mock Next.js router (`next/navigation`)
- Mock Next.js Link component
- Mock Audio API for sound tests
- Setup test utilities (render helpers, custom queries)

---

## Test Implementation Priority

### Phase 1: Critical Path (High Priority)
1. Quiz Session component (core functionality)
2. Quiz Hub component (quiz selection)
3. Quiz Page Client (routing and config loading)
4. Conjugation logic utilities

### Phase 2: User Experience (Medium Priority)
5. Home page navigation
6. Sound Toggle
7. Theme Toggle
8. UI Components (Button, Input, Card)

### Phase 3: Polish & Edge Cases (Lower Priority)
9. Cheat Sheet page
10. Error handling
11. Accessibility tests
12. Performance tests

---

## Notes

- Focus on user-facing functionality first
- Mock external dependencies (localStorage, Audio API, Next.js router)
- Use React Testing Library best practices (queries by role, user events)
- Test user interactions, not implementation details
- Ensure tests are maintainable and readable
- Consider visual regression testing for UI components (optional)

---

## Success Criteria

- ✅ All critical user flows have test coverage
- ✅ Core quiz functionality is thoroughly tested
- ✅ Component interactions work correctly
- ✅ Edge cases and error scenarios are handled
- ✅ Tests run fast (<30 seconds total)
- ✅ Tests are reliable (no flaky tests)
