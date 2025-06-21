import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, Users, MapPin, Video, Star } from 'lucide-react';
import { mockSessions } from '../data/mockData';

export default function SessionList({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'all' || session.difficulty === selectedDifficulty;
    const matchesLocation = selectedLocation === 'all' || session.location === selectedLocation;
    const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus;

    return matchesSearch && matchesDifficulty && matchesLocation && matchesStatus;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recruiting': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'recruiting': return '募集中';
      case 'full': return '満席';
      case 'in-progress': return '進行中';
      case 'completed': return '完了';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">GDセッション一覧</h1>
        <p className="text-gray-600 mt-2">参加したいセッションを見つけましょう</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="セッションを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべてのレベル</option>
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての場所</option>
            <option value="online">オンライン</option>
            <option value="offline">オフライン</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべてのステータス</option>
            <option value="recruiting">募集中</option>
            <option value="full">満席</option>
            <option value="completed">完了</option>
          </select>
        </div>
      </div>

      {/* Session Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
                    {session.difficulty === 'beginner' ? '初級' :
                     session.difficulty === 'intermediate' ? '中級' : '上級'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {session.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(session.scheduledAt).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {session.duration}分
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {session.currentParticipants} / {session.maxParticipants}人
                </div>
                <div className="flex items-center">
                  {session.location === 'online' ? (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      オンライン
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      {session.venue}
                    </>
                  )}
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center mb-4">
                <img
                  src={session.organizer.avatar}
                  alt={session.organizer.name}
                  className="h-8 w-8 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.organizer.name}</p>
                  <p className="text-xs text-gray-600">{session.organizer.university}</p>
                </div>
                <div className="ml-auto flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">4.8</span>
                </div>
              </div>

              {/* Requirements */}
              {session.requirements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">参加条件</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {session.requirements.map((req, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {new Date(session.scheduledAt).toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} 開始
                </div>
                <button
                  disabled={session.status === 'full' || session.status === 'completed'}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    session.status === 'recruiting'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {session.status === 'recruiting' ? '参加申請' :
                   session.status === 'full' ? '満席' : '終了'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">条件に合うセッションが見つかりません</h3>
          <p className="text-gray-600 mb-6">検索条件を変更するか、新しいセッションを作成してみてください。</p>
          <button
            onClick={() => onNavigate('create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            セッションを作成
          </button>
        </div>
      )}
    </div>
  );
}