# SMS Forwarder

A React Native application that forwards all SMS messages received on your Android phone to specified email addresses.

## Features

- ✅ **Add Email Addresses**: Simple interface to add email addresses for SMS forwarding
- ✅ **Delete Email Addresses**: Remove email addresses from the forwarding list
- ✅ **Email Validation**: Validates email format before adding
- ✅ **Persistent Storage**: Email list is saved using AsyncStorage
- ✅ **SMS Monitoring**: Automatically detects incoming SMS messages
- ✅ **SMS Counter**: Displays count of received SMS messages
- ✅ **Clean UI**: Modern, intuitive interface with Material Design principles

## Prerequisites

- Node.js (v14 or higher)
- React Native development environment set up
- Android Studio (for Android development)
- Android device or emulator

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SmsForwarder
```

2. Install dependencies:
```bash
npm install
```

3. For Android, install additional dependencies:
```bash
cd android
./gradlew clean
cd ..
```

## Running the App

### Android

```bash
npm run android
```

Or using React Native CLI:
```bash
react-native run-android
```

### iOS

```bash
npm run ios
```

Note: SMS forwarding features are primarily designed for Android devices.

## Permissions

The app requires the following Android permissions:
- `RECEIVE_SMS`: To detect incoming SMS messages
- `READ_SMS`: To read SMS message content

These permissions will be requested when the app first launches.

## Usage

1. **Add an Email Address**:
   - Enter a valid email address in the input field
   - Tap the "Add" button
   - The email will be added to the list below

2. **Delete an Email Address**:
   - Tap the "Delete" button next to any email in the list
   - Confirm the deletion in the popup dialog

3. **SMS Forwarding**:
   - Once email addresses are added, all incoming SMS messages will be forwarded to those addresses
   - The SMS counter at the top shows how many messages have been received

## Testing

Run tests with:
```bash
npm test
```

## Linting

Check code style with:
```bash
npm run lint
```

## Project Structure

```
SmsForwarder/
├── App.js                 # Main application component
├── index.js              # App entry point
├── package.json          # Dependencies and scripts
├── __tests__/           # Test files
│   └── App.test.js      # App component tests
├── android/             # Android native code
└── ios/                 # iOS native code (if applicable)
```

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **AsyncStorage**: Local data persistence
- **react-native-android-sms-listener**: SMS monitoring for Android
- **Jest & React Native Testing Library**: Testing framework

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub. 
