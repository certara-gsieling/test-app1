import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';

const isProd = process.env.NODE_ENV === 'production';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'tools/checkstyle.jar',
      'target/**',
      'public/**'
    ]
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.jest },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      react: reactPlugin
    },
    settings: { react: { version: 'detect' } },
    rules: {
      curly: ['error', 'all'],
      'react/react-in-jsx-scope': 'off',
      // Disallow console.* in production builds (allow warn/error)
      'no-console': isProd ? ['error', { allow: ['warn', 'error'] }] : 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: [
                'useState',
                'useEffect',
                'useLayoutEffect',
                'useMemo',
                'useCallback',
                'useRef',
                'useReducer',
                'useContext',
                'useImperativeHandle',
                'useDebugValue',
                'useDeferredValue',
                'useId',
                'useInsertionEffect',
                'useSyncExternalStore',
                'useTransition',
                'useOptimistic',
                'useActionState'
              ],
              message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.'
            },
            {
              name: 'react-redux',
              importNames: [
                'useDispatch',
                'useSelector',
                'useStore'
              ],
              message: 'React-Redux hooks are not allowed. Use connect() HOC instead.'
            }
          ]
        }
      ],
      'no-restricted-properties': [
        'error',
        { object: 'React', property: 'useState', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useEffect', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useLayoutEffect', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useMemo', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useCallback', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useRef', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useReducer', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useContext', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useImperativeHandle', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useDebugValue', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useDeferredValue', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useId', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useInsertionEffect', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useSyncExternalStore', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useTransition', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useOptimistic', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' },
        { object: 'React', property: 'useActionState', message: 'React hooks are not allowed. Use Redux Toolkit patterns instead.' }
      ]
    }
  }
];


