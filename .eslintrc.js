module.exports = {
  extends: '@react-native-community',
  globals: {
    JSX: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-native', 'react-hooks'],
  root: false,
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-catch-shadow': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            importNames: [
              'TouchableOpacity',
              'TouchableNativeFeedback',
              'TouchableHighlight',
              'FlatList',
            ],
            message:
              "Please, import it from 'react-native' to avoid unexpected errors.",
            name: 'react-native-gesture-handler',
          },
          {
            importNames: ['Button'],
            message:
              'Please, use Button from components folder to match the project style.',
            name: 'react-native',
          },
          {
            importNames: ['Modal'],
            message:
              'Please, use Modal from components folder to match the project style.',
            name: 'react-native',
          },
          {
            importNames: ['TextInput'],
            message:
              'Please, use TextInput from components folder to match the project style.',
            name: 'react-native',
          },
          {
            importNames: ['Dash', 'DashProps'],
            message:
              'Please, use TextInput from components folder to match the project style.',
            name: 'react-native-dash',
          },
          {
            importNames: ['useActionSheet'],
            message:
              'Please, use useActionSheet from hooks folder to match the project style.',
            name: '@expo/react-native-action-sheet',
          },
        ],
      },
    ],
    'no-shadow': 'off',
    'no-spaced-func': 'off',
    'no-unused-vars': 'warn',
    'prettier/prettier': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
  },
};
