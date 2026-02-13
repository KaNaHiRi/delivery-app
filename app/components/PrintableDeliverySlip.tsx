'use client';

import React from 'react';
import { Delivery } from '../types/delivery';

interface PrintableDeliverySlipProps {
  deliveries: Delivery[];
  onClose: () => void;
}

export default function PrintableDeliverySlip({ deliveries, onClose }: PrintableDeliverySlipProps) {
  // 印刷実行
  const handlePrint = () => {
    window.print();
  };

  // ステータスを日本語に変換
  const getStatusLabel = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return '配送前';
      case 'in_transit': return '配送中';
      case 'completed': return '配送完了';
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <>
      {/* モーダルオーバーレイ（画面表示用） */}
      <div className="fixed inset-0 bg-black/50 z-40 print:hidden" onClick={onClose} />
      
      {/* モーダルコンテンツ（画面表示用） */}
      <div className="fixed inset-4 md:inset-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 flex flex-col print:hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">印刷プレビュー</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              印刷する
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
            {deliveries.map((delivery, index) => (
              <div key={delivery.id} className={index > 0 ? 'mt-8 pt-8 border-t-2 border-dashed border-gray-300' : ''}>
                <div className="border-2 border-gray-800 p-6">
                  <h3 className="text-2xl font-bold text-center mb-6 pb-2 border-b-2 border-gray-800">
                    配送伝票
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-gray-300">
                        伝票番号
                      </div>
                      <div className="flex-1 px-3 py-2 border border-l-0 border-gray-300">
                        {delivery.id}
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                        配送先名
                      </div>
                      <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                        {delivery.name}
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                        配送先住所
                      </div>
                      <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                        {delivery.address}
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                        配送日
                      </div>
                      <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                        {formatDate(delivery.deliveryDate)}
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                        ステータス
                      </div>
                      <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                        {getStatusLabel(delivery.status)}
                      </div>
                    </div>
                  </div>

                  {/* 署名欄 */}
                  <div className="mt-8 pt-6 border-t border-gray-300">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="text-sm font-bold mb-2">配送者署名</div>
                        <div className="border-b-2 border-gray-400 h-12"></div>
                      </div>
                      <div>
                        <div className="text-sm font-bold mb-2">受取者署名</div>
                        <div className="border-b-2 border-gray-400 h-12"></div>
                      </div>
                    </div>
                  </div>

                  {/* フッター */}
                  <div className="mt-6 text-xs text-gray-600 text-right">
                    印刷日時: {new Date().toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 印刷用レイアウト（印刷時のみ表示） */}
      <div className="hidden print:block">
        {deliveries.map((delivery, index) => (
          <div key={delivery.id} className={index > 0 ? 'page-break' : ''}>
            <div className="border-2 border-gray-800 p-6">
              <h3 className="text-2xl font-bold text-center mb-6 pb-2 border-b-2 border-gray-800">
                配送伝票
              </h3>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-gray-300">
                    伝票番号
                  </div>
                  <div className="flex-1 px-3 py-2 border border-l-0 border-gray-300">
                    {delivery.id}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                    配送先名
                  </div>
                  <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                    {delivery.name}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                    配送先住所
                  </div>
                  <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                    {delivery.address}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                    配送日
                  </div>
                  <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                    {formatDate(delivery.deliveryDate)}
                  </div>
                </div>

                <div className="flex">
                  <div className="w-32 font-bold bg-gray-100 px-3 py-2 border border-t-0 border-gray-300">
                    ステータス
                  </div>
                  <div className="flex-1 px-3 py-2 border border-t-0 border-l-0 border-gray-300">
                    {getStatusLabel(delivery.status)}
                  </div>
                </div>
              </div>

              {/* 署名欄 */}
              <div className="mt-8 pt-6 border-t border-gray-300">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-sm font-bold mb-2">配送者署名</div>
                    <div className="border-b-2 border-gray-400 h-12"></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold mb-2">受取者署名</div>
                    <div className="border-b-2 border-gray-400 h-12"></div>
                  </div>
                </div>
              </div>

              {/* フッター */}
              <div className="mt-6 text-xs text-gray-600 text-right">
                印刷日時: {new Date().toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}