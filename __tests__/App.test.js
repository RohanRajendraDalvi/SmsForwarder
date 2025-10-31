import 'react-native';
import React from 'react';
import App from '../App';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-android-sms-listener', () => ({
  addListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  PERMISSIONS: {
    RECEIVE_SMS: 'android.permission.RECEIVE_SMS',
    READ_SMS: 'android.permission.READ_SMS',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  requestMultiple: jest.fn(() => Promise.resolve({
    'android.permission.RECEIVE_SMS': 'granted',
    'android.permission.READ_SMS': 'granted',
  })),
}));

describe('SMS Forwarder App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('renders correctly', () => {
    const {getByText} = render(<App />);
    expect(getByText('SMS Forwarder')).toBeTruthy();
    expect(getByText('Add Email Address')).toBeTruthy();
  });

  it('displays empty state when no emails are added', () => {
    const {getByText} = render(<App />);
    expect(getByText(/No emails added yet/)).toBeTruthy();
  });

  it('allows adding a valid email', async () => {
    const {getByPlaceholderText, getByText} = render(<App />);
    
    const input = getByPlaceholderText('Enter email address');
    const addButton = getByText('Add');

    fireEvent.changeText(input, 'test@example.com');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@email_list',
        JSON.stringify(['test@example.com'])
      );
    });
  });

  it('validates email format', async () => {
    const {getByPlaceholderText, getByText} = render(<App />);
    
    const input = getByPlaceholderText('Enter email address');
    const addButton = getByText('Add');

    fireEvent.changeText(input, 'invalid-email');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('loads emails from storage on mount', async () => {
    const mockEmails = ['test1@example.com', 'test2@example.com'];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockEmails));

    const {getByText} = render(<App />);

    await waitFor(() => {
      expect(getByText('test1@example.com')).toBeTruthy();
      expect(getByText('test2@example.com')).toBeTruthy();
    });
  });

  it('shows email count', async () => {
    const mockEmails = ['test1@example.com', 'test2@example.com'];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockEmails));

    const {getByText} = render(<App />);

    await waitFor(() => {
      expect(getByText('Email List (2)')).toBeTruthy();
    });
  });
});
