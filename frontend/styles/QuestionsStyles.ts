import { StyleSheet, Platform } from 'react-native';

export const QuestionsStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  clearButton: { 
    padding: 5 
  },
  messagesContainer: { 
    flex: 1, 
    paddingHorizontal: 10 
  },
  messagesContentContainer: { 
    paddingVertical: 10, 
    flexGrow: 1 
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    minWidth: '20%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
  },
  userMessageText: { 
    fontSize: 16, 
    color: '#fff' 
  },
  botMessageText: { 
    fontSize: 16, 
    color: '#000' 
  },
  userMessageTimestamp: {
    fontSize: 10,
    color: '#E5E5EA',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  botMessageTimestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: { 
    marginLeft: 10 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  emptyText: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#8E8E93', 
    marginTop: 20 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#C7C7CC', 
    marginTop: 8 
  },
}); 