import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export default function HomeScreen() {
  const [data, setData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET 요청
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      setData(response.data); // 자동으로 JSON 변환됨
    } catch (err) {
      setError('데이터를 가져오는데 실패했습니다');
      console.error('API 에러:', err);
    } finally {
      setLoading(false);
      
    }
  };

  // POST 요청
  const createPost = async () => {
    try {
      const response = await axios
      .post('https://jsonplaceholder.typicode.com/posts', {
        title: '새 게시물',
        body: '게시물 내용',
        userId: 1,
      });
      console.log('생성된 데이터:', response.data);
    } catch (err) {
      console.error('POST 에러:', err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity 
        onPress={fetchData}
        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? '로딩 중...' : 'GET 요청'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={createPost}
        style={{ backgroundColor: '#34C759', padding: 12, borderRadius: 8, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>POST 요청</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      
      {data && (
        <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>제목: {data.title}</Text>
          <Text style={{ marginTop: 10 }}>내용: {data.body}</Text>
        </View>
      )}
    </View>
  );
}
