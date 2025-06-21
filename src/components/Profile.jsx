import React, { useState, useEffect } from 'react';
import { Edit2, Mail, CaseSensitive as University, GraduationCap, Target, Star, Award, Calendar, TrendingUp, Users } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile({ onNavigate, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    university: '',
    major: '',
    year: '大学3年生',
    targetIndustries: [],
    gdExperience: 'beginner'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        console.log('プロフィールがまだ作成されていません。');
        setProfile(prev => ({ ...prev, displayName: user.displayName || '', targetIndustries: [], gdExperience: 'beginner' }));
        setIsEditing(true);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, profile, { merge: true });
      alert('プロフィールを保存しました！');
      setIsEditing(false);
      onNavigate('dashboard');
    } catch (error) {
      console.error('プロフィールの保存に失敗しました:', error);
      alert('プロフィールの保存に失敗しました。');
    }
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

  if (loading) {
    return <div className="text-center py-10">プロフィールを読み込み中...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              編集
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <img
                src={user.photoURL}
                alt={profile.displayName}
                className="h-20 w-20 rounded-full object-cover mr-6"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{profile.displayName}</h2>
                <p className="text-gray-600">{profile.university} {profile.major}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.gdExperience === 'beginner' ? 'bg-green-100 text-green-800' :
                    profile.gdExperience === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profile.gdExperience === 'beginner' ? 'GD初級者' :
                     profile.gdExperience === 'intermediate' ? 'GD中級者' : 'GD上級者'}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
                  <input
                    type="text" name="displayName" value={profile.displayName} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">大学</label>
                  <input
                    type="text" name="university" value={profile.university} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学部・専攻</label>
                  <input
                    type="text" name="major" value={profile.major} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                  <select
                    name="year" value={profile.year} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>大学1年生</option>
                    <option>大学2年生</option>
                    <option>大学3年生</option>
                    <option>大学4年生</option>
                    <option>大学院修士1年</option>
                    <option>大学院修士2年</option>
                    <option>大学院博士課程</option>
                    <option>既卒</option>
                    <option>その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GD経験レベル</label>
                  <select
                    value={profile.gdExperience}
                    onChange={(e) => setProfile({...profile, gdExperience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">初級（経験なし〜少ない）</option>
                    <option value="intermediate">中級（ある程度の経験あり）</option>
                    <option value="advanced">上級（豊富な経験・高いスキル）</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <University className="h-5 w-5 mr-3" />
                  <span>{profile.university}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="h-5 w-5 mr-3" />
                  <span>{profile.year} {profile.major}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Target className="h-5 w-5 mr-3" />
                  <span>{profile.targetIndustries.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

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

        <div className="space-y-6">
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

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">志望業界</h3>
            <div className="space-y-2">
              {profile.targetIndustries.map((industry) => (
                <span
                  key={industry}
                  className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>

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