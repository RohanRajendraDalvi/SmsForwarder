import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SmsListener from 'react-native-android-sms-listener';

const STORAGE_KEY = '@email_list';

const App = () => {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [smsCount, setSmsCount] = useState(0);

  useEffect(() => {
    loadEmails();
    requestSmsPermission();
  }, []);

  useEffect(() => {
    let subscription;
    
    if (Platform.OS === 'android') {
      subscription = SmsListener.addListener(message => {
        handleIncomingSms(message);
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [emails]);

  const requestSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        ]);
        
        if (
          granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('SMS permissions granted');
        } else {
          Alert.alert(
            'Permission Required',
            'SMS permissions are required for this app to work properly.'
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleIncomingSms = async (message) => {
    console.log('Received SMS:', message);
    setSmsCount(prev => prev + 1);
    
    if (emails.length > 0) {
      const smsDetails = {
        from: message.originatingAddress || 'Unknown',
        body: message.body || '',
        timestamp: new Date().toISOString(),
      };
      
      console.log('SMS would be forwarded to:', emails);
      console.log('SMS Details:', smsDetails);
    }
  };

  const loadEmails = async () => {
    try {
      const storedEmails = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEmails !== null) {
        setEmails(JSON.parse(storedEmails));
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      Alert.alert('Error', 'Failed to load email list');
    }
  };

  const saveEmails = async (emailList) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emailList));
    } catch (error) {
      console.error('Error saving emails:', error);
      Alert.alert('Error', 'Failed to save email list');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = () => {
    const trimmedEmail = newEmail.trim();
    
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (emails.includes(trimmedEmail)) {
      Alert.alert('Error', 'This email is already in the list');
      return;
    }

    const updatedEmails = [...emails, trimmedEmail];
    setEmails(updatedEmails);
    saveEmails(updatedEmails);
    setNewEmail('');
    Alert.alert('Success', 'Email added successfully');
  };

  const deleteEmail = (emailToDelete) => {
    Alert.alert(
      'Delete Email',
      `Are you sure you want to remove ${emailToDelete}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEmails = emails.filter(email => email !== emailToDelete);
            setEmails(updatedEmails);
            saveEmails(updatedEmails);
            Alert.alert('Success', 'Email removed successfully');
          },
        },
      ]
    );
  };

  const renderEmailItem = ({item}) => (
    <View style={styles.emailItem}>
      <Text style={styles.emailText}>{item}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteEmail(item)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      <View style={styles.header}>
        <Text style={styles.title}>SMS Forwarder</Text>
        <Text style={styles.subtitle}>
          SMS received: {smsCount}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Add Email Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#999"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.addButton} onPress={addEmail}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            Email List ({emails.length})
          </Text>
          {emails.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No emails added yet. Add an email to start forwarding SMS.
              </Text>
            </View>
          ) : (
            <FlatList
              data={emails}
              renderItem={renderEmailItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.list}
            />
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            All SMS received on this phone will be forwarded to the email addresses listed above.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    height: 48,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  list: {
    flex: 1,
  },
  emailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: 6,
    marginBottom: 8,
  },
  emailText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
});

export default App;
