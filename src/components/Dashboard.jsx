import React from 'react';
import { Calendar, Users, Trophy, TrendingUp, Clock, MapPin, Video } from 'lucide-react';
import { mockSessions, currentUser } from '../data/mockData';

export default function Dashboard({ onNavigate }) {
  const upcomingSessions = mockSessions.filter(session => 
    session.participants.some(p => p.id === currentUser.id) && 
    new Date(session.scheduledAt) > new Date()
  );

  const stats = [
    { label: '参加セッション数', value: '12', icon: Users, color: 'bg-blue-500' },
    { label: '今月の参加回数', value: '4', icon: Calendar, color: 'bg-green-500' },
    { label: '平均評価スコア', value: '4.2', icon: Trophy, color: 'bg-yellow-500' },
    { label: '成長率', value: '+15%', icon: TrendingUp, color: 'bg-purple-500' }
  ];

  const recommendedSessions = mockSessions.filter(session => 
    session.status === 'recruiting' && 
    !session.participants.some(p => p.id === currentUser.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          おかえりなさい、{currentUser.name}さん
        </h1>
        <p className="text-gray-600 mt-2">今日も就活スキルを磨いていきましょう！</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">参加予定のセッション</h2>
          </div>
          <div className="p-6">
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{session.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        session.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {session.difficulty === 'beginner' ? '初級' :
                         session.difficulty === 'intermediate' ? '中級' : '上級'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.scheduledAt).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration}分
                      </div>
                      <div className="flex items-center">
                        {session.location === 'online' ? (
                          <>
                            <Video className="h-4 w-4 mr-1" />
                            オンライン
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-1" />
                            オフライン
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">参加予定のセッションがありません</p>
                <button
                  onClick={() => onNavigate('sessions')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  セッションを探す
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Sessions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">おすすめのセッション</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recommendedSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <span className="text-sm text-gray-500">
                      {session.currentParticipants}/{session.maxParticipants}人
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {session.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(session.scheduledAt).toLocaleDateString('ja-JP')}
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      参加する
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">新しいセッションを作成しませんか？</h3>
            <p className="text-blue-100">他の就活生と一緒にスキルアップしましょう</p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            セッションを作成
          </button>
        </div>
      </div>
    </div>
  );
}