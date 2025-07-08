# Development Guidelines

## Translations

### Never hardcode strings of text
- All user-facing text must be made translatable using the translation system.
- Even placeholders, button labels, error messages, and other seemingly minor text should be translatable.
- The project uses `next-intl` for translations.

### How to make text translatable:
1. Add the text to the appropriate section in the translation files:
   - `/messages/en.json` (English)
   - `/messages/uk.json` (Ukrainian)
   - `/messages/pl.json` (Polish)
   - Add to all language files when adding a new string

2. Use the `useTranslations` hook to access translations in components:
   ```tsx
   // Import the hook
   import { useTranslations } from 'next-intl'
   
   // Inside your component
   const t = useTranslations('namespace') // e.g., 'common', 'offers', etc.
   
   // Use translations
   return <button>{t('button_label')}</button>
   ```

3. When updating item names or other existing translations, make sure to update all language files to maintain consistency.

### Translation organization:
- Translations are organized by namespaces (e.g., 'common', 'offers', 'docs')
- Use appropriate namespaces for different parts of the application
- Keep related translations together in the same namespace

## Avoiding useEffect

### Try to avoid useEffect where possible
- `useEffect` can lead to complex dependencies, race conditions, and unnecessary re-renders
- Consider these alternatives:

### Alternatives to useEffect:

1. **For data fetching:**
   - Use React Query, SWR, or other data fetching libraries
   - Consider server components for data fetching when possible
   - Use React Suspense for loading states

2. **For state synchronization:**
   - Derive state directly in render instead of using useEffect to update it
   - Use custom hooks to encapsulate related state logic
   - Consider state management libraries for complex state

3. **For event handling:**
   - Handle events directly in event handlers rather than setting up listeners in useEffect
   - Use the `useEvent` hook for stable event handlers

4. **For initialization:**
   - Initialize state directly when declaring it
   - Use lazy initialization with useState if the initialization is expensive

### When useEffect is appropriate:
- Integrating with non-React systems (DOM APIs, third-party libraries)
- Setting up and cleaning up subscriptions
- Measuring DOM nodes with imperative code
- Logging that should happen on component mount/unmount

Remember that each useEffect should have a single responsibility and clear dependencies.

[[calls]]
match = "when the user requests code examples, setup or configuration steps, or library/API documentation"
tool = "context7"
