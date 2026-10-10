import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CampusDestinationSearchProps {
  onSearch: (query: string) => void;
}

export default function CampusDestinationSearch({ onSearch }: CampusDestinationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <View className="w-full p-4 bg-white rounded-xl shadow-sm">
      {/* Search Input Container */}
      <View className="flex-row items-center border border-gray-200 rounded-lg bg-gray-50 px-3 py-2">
        <TextInput
          className="flex-1 text-base text-gray-800"
          placeholder="Where are you heading on campus?"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-md"
          onPress={handleSearch}
        >
          <Text className="text-white font-semibold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* ✨ Gemini AI Visual Badge Added Here */}
      <View className="flex-row items-center mt-2 px-1">
        <Text className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full mr-2">
          AI Smart Search
        </Text>
        <Text className="text-xs text-gray-500 italic">
          Powered by Gemini AI
        </Text>
      </View>
    </View>
  );
}
