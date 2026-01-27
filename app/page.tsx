export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          配送管理システム
        </h1>
        <p className="text-gray-600 mb-8">
          これから60日で案件獲得を目指します
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">今日の進捗</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              開発環境構築完了
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              最初のNext.jsアプリ作成
            </li>
            <li className="flex items-center text-gray-400">
              <span className="mr-2">○</span>
              配送先一覧機能の実装
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}