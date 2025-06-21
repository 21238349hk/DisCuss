import React, { useState } from 'react';
import { Edit2, Mail, CaseSensitive as University, GraduationCap, Target, Star, Award, Calendar, TrendingUp, Users } from 'lucide-react';
import { currentUser } from '../data/mockData';

export default function Profile({ onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    university: currentUser.university,
    year: currentUser.year,
    major: currentUser.major,
    targetIndustries: currentUser.targetIndustries,
    gdExperience: currentUser.gdExperience
  });

  const handleSave = () => {
    // Save changes (in real app, this would call an API)
    setIsEditing(false);
    alert('プロフィールが更新されました！');
  };

  const stats = [
    { label: '参加セッション数', value: '24', icon: Calendar, color: 'text-blue-600' },
    { label: '平均評価', value: '4.2', icon: Star, color: 'text-yellow-500' },
    { label: '作成セッション数', value: '8', icon: Award, color: 'text-green-600' },
    { label: '成長スコア', value: '+18%', icon: TrendingUp, color: 'text-purple-600' }
  ];

  const recentEvaluations = [
    { session: '金融業界志望者向けGD', score: 4.5, date: '2024-03-10' },
    { session: 'コンサル業界研究GD', score: 4.2, date: '2024-03-08' },
    { session: 'IT業界初心者歓迎GD', score: 4.7, date: '2024-03-05' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? 'キャンセル' : '編集'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-full object-cover mr-6"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{currentUser.name}</h2>
                <p className="text-gray-600">{currentUser.university} {currentUser.major}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentUser.gdExperience === 'beginner' ? 'bg-green-100 text-green-800' :
                    currentUser.gdExperience === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentUser.gdExperience === 'beginner' ? 'GD初級者' :
                     currentUser.gdExperience === 'intermediate' ? 'GD中級者' : 'GD上級者'}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">大学</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">学年</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="3年">3年</option>
                      <option value="4年">4年</option>
                      <option value="修士1年">修士1年</option>
                      <option value="修士2年">修士2年</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">学部・専攻</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GD経験レベル</label>
                  <select
                    value={formData.gdExperience}
                    onChange={(e) => setFormData({...formData, gdExperience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">初級（経験なし〜少ない）</option>
                    <option value="intermediate">中級（ある程度の経験あり）</option>
                    <option value="advanced">上級（豊富な経験・高いスキル）</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <University className="h-5 w-5 mr-3" />
                  <span>{currentUser.university}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="h-5 w-5 mr-3" />
                  <span>{currentUser.year} {currentUser.major}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Target className="h-5 w-5 mr-3" />
                  <span>{currentUser.targetIndustries.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">最近の評価</h3>
            <div className="space-y-4">
              {recentEvaluations.map((evaluation, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{evaluation.session}</h4>
                    <p className="text-sm text-gray-600">{new Date(evaluation.date).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="text-lg font-semibold text-gray-900">{evaluation.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">統計</h3>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <stat.icon className={`h-5 w-5 mr-3 ${stat.color}`} />
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Industries */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">志望業界</h3>
            <div className="space-y-2">
              {currentUser.targetIndustries.map((industry) => (
                <span
                  key={industry}
                  className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">達成バッジ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">初セッション</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">高評価獲得</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">リーダー</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">成長中</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}