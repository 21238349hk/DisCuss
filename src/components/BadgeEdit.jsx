export default function BadgeEdit({ user, onNavigate }) {
  const [selectedBadges, setSelectedBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setSelectedBadges(data.badges || []);
      }
    };
    if (user) fetchBadges();
  }, [user]);

  const toggleBadge = (id) => {
    setSelectedBadges((prev) => {
      if (prev.includes(id)) return prev.filter(b => b !== id);
      if (prev.length >= 4) return prev; // 最大4つまで
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { badges: selectedBadges }, { merge: true });
    alert('バッジを保存しました！');
    onNavigate('profile'); // ← 修正点
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">バッジ編集（最大4つ）</h2>
      <div className="grid grid-cols-2 gap-4">
        {allBadges.map(badge => (
          <div
            key={badge.id}
            onClick={() => toggleBadge(badge.id)}
            className={`p-3 border rounded cursor-pointer text-center ${
              selectedBadges.includes(badge.id)
                ? 'bg-blue-200 border-blue-500'
                : 'bg-white'
            }`}
          >
            {badge.label}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={() => onNavigate('profile')} className="px-4 py-2 bg-gray-300 rounded">キャンセル</button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">保存</button>
      </div>
    </div>
  );
}
