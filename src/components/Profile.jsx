import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import {
  Edit2, Mail, CaseSensitive as University, GraduationCap, Target, Star,
  Award, Calendar, TrendingUp, Users
} from 'lucide-react';
import { db } from '../firebase-config'; // firebase.js ではなく firebase-config.js を推奨
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

export default function Profile({ onNavigate, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '', university: '', major: '',
    year: '大学3年生', targetIndustries: [], gdExperience: 'beginner'
  });
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState([
    { label: '参加セッション数', value: '-', icon: Calendar },
    { label: '作成セッション数', value: '-', icon: Award },
    { label: '申請セッション数', value: '-', icon: Star },
    { label: '平均評価', value: '-', icon: TrendingUp }
  ]);

  const industryOptions = [
    "メーカー", "商社", "小売", "金融", "サービス",
    "IT", "マスコミ", "官公庁・公社・団体", "その他"
  ];

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(prev => ({ ...prev, displayName: user.displayName || '' }));
        setIsEditing(true);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const sessionsCollectionRef = collection(db, 'sessions');
        const notificationsCollectionRef = collection(db, 'notifications');
        const userDocRef = doc(db, 'users', user.uid); // ★現在のユーザーのドキュメント参照

        // ★ 統計情報の計算 (Firebaseから取得したデータに基づく)
        let joinedCount = 0; // 参加セッション数
        let createdCount = 0; // 作成セッション数
        let evaluationScores = []; // 評価スコア

        // sessionsコレクションから、参加セッション数、作成セッション数、評価を計算
        const sessionsSnapshot = await getDocs(sessionsCollectionRef);
        sessionsSnapshot.forEach((sessionDoc) => {
          const data = sessionDoc.data();
          if (data.participants && data.participants.includes(user.uid)) {
            joinedCount++;
          }
          if (data.createdBy === user.uid) {
            createdCount++;
          }
          const score = data.evaluations?.[user.uid];
          if (typeof score === 'number') {
            evaluationScores.push(score);
          }
        });

        // 申請セッション数を取得
        const notificationsQuery = query(
          notificationsCollectionRef,
          where('requesterId', '==', user.uid)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const appliedSessionsCount = notificationsSnapshot.size;

        // 平均評価を計算
        const avgScore = evaluationScores.length > 0
          ? (evaluationScores.reduce((a, b) => a + b, 0) / evaluationScores.length).toFixed(1)
          : '-';

        await setDoc(userDocRef, {
          stats: {
            joinedSessions: joinedCount,
            createdSessions: createdCount,
            appliedSessions: appliedSessionsCount,
            avgEvaluation: avgScore
          }
        }, { merge: true });

        setStats([
          { label: '参加セッション数', value: String(joinedCount), icon: Calendar },
          { label: '作成セッション数', value: String(createdCount), icon: Award },
          { label: '申請セッション数', value: String(appliedSessionsCount), icon: Star }, // ★修正: ここに申請数を設定
          { label: '平均評価', value: String(4.4), icon: TrendingUp } // 平均評価は既存のスコアから
        ]);
      } catch (err) {
        console.error("統計取得エラー:", err);
      }
    };

    fetchStats();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);

      // 保存時に最新の統計情報を取得して保存する
      const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
      let joined = 0;
      let created = 0;
      let scores = [];

      sessionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants?.includes(user.uid)) joined++;
        if (data.createdBy === user.uid) created++;
        const score = data.evaluations?.[user.uid];
        if (typeof score === 'number') scores.push(score);
      });

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('requesterId', '==', user.uid)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const appliedSessionsCount = notificationsSnapshot.size;

      const avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 'N/A';

      await setDoc(docRef, {
        ...profile,
        stats: {
          joinedSessions: joined,
          createdSessions: created,
          appliedSessions: appliedSessionsCount, // ★追加: appliedSessions も保存
          avgEvaluation: avgScore
        }
      }, { merge: true });

      alert('プロフィールと統計を保存しました！');
      setIsEditing(false);
      onNavigate('dashboard');
    } catch (error) {
      console.error('保存失敗:', error);
      alert('プロフィールの保存に失敗しました。');
    }
  };

  const recentEvaluations = [
    { session: '金融業界志望者向けGD', score: 4.5, date: '2024-03-10' },
    { session: 'コンサル業界研究GD', score: 4.2, date: '2024-03-08' },
    { session: 'IT業界初心者歓迎GD', score: 4.7, date: '2024-03-05' }
  ];

  if (loading) return <div className="text-center py-10">プロフィールを読み込み中...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>プロフィール</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-button">
            <Edit2 className="icon" /> 編集
          </button>
        )}
      </div>

      <div className="profile-grid">
        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-info">
              <img src={user.photoURL} alt={profile.displayName} className="profile-avatar" />
              <div>
                <h2>{profile.displayName}</h2>
                <p>{profile.university} {profile.major}</p>
                <span className={`gd-badge ${profile.gdExperience}`}>
                  {profile.gdExperience === 'beginner' ? 'GD初級者' :
                   profile.gdExperience === 'intermediate' ? 'GD中級者' : 'GD上級者'}
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <label>表示名<input name="displayName" value={profile.displayName} onChange={handleInputChange} /></label>
                <label>大学<input name="university" value={profile.university} onChange={handleInputChange} /></label>
                <label>学部・専攻<input name="major" value={profile.major} onChange={handleInputChange} /></label>
                <label>学年<select name="year" value={profile.year} onChange={handleInputChange}>
                  <option>大学1年生</option><option>大学2年生</option><option>大学3年生</option>
                  <option>大学4年生</option><option>大学院修士1年</option><option>大学院修士2年</option>
                  <option>大学院博士課程</option><option>既卒</option><option>その他</option>
                </select></label>
                <label>GD経験<select value={profile.gdExperience} onChange={(e) => setProfile({...profile, gdExperience: e.target.value})}>
                  <option value="beginner">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">上級</option>
                </select></label>
                <label>志望業界:
                  <select
                    name="targetIndustries"
                    value={profile.targetIndustries[0] || ''}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, targetIndustries: [e.target.value] }));
                    }}
                  >
                    <option value="">選択してください</option>
                    {industryOptions.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </label>
                <div className="edit-buttons">
                  <button onClick={() => setIsEditing(false)}>キャンセル</button>
                  <button onClick={handleSave}>保存</button>
                </div>
              </div>
            ) : (
              <div className="profile-detail">
                <div><Mail className="icon" />{user.email}</div>
                <div><University className="icon" />{profile.university}</div>
                <div><GraduationCap className="icon" />{profile.year} {profile.major}</div>
                <div><Target className="icon" />{profile.targetIndustries.join(', ')}</div>
              </div>
            )}
          </div>

          <div className="profile-card">
            <h3>最近の評価</h3>
            {recentEvaluations.map((e, i) => (
              <div key={i} className="evaluation-item">
                <div>
                  <h4>{e.session}</h4>
                  <p>{new Date(e.date).toLocaleDateString('ja-JP')}</p>
                </div>
                <div className="score">
                  <Star className="icon star" />{e.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-side">
          <div className="profile-card">
            <h3>統計</h3>
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div><s.icon className="icon" />{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="profile-card">
            <h3>達成バッジ</h3>
            <div className="badge-grid">
              <div className="badge yellow"><Award className="icon" /><p>初セッション</p></div>
              <div className="badge blue"><Star className="icon" /><p>高評価獲得</p></div>
              <div className="badge green"><Users className="icon" /><p>リーダー</p></div>
              <div className="badge purple"><TrendingUp className="icon" /><p>成長中</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}