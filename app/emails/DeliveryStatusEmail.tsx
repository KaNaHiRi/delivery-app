import {
  Html, Head, Body, Container, Section,
  Heading, Text, Hr, Preview
} from '@react-email/components';

interface DeliveryStatusEmailProps {
  recipientName: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryDate: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}

const statusLabel: Record<string, string> = {
  pending: '配送待ち',
  in_transit: '配送中',
  completed: '完了',
};

export function DeliveryStatusEmail({
  recipientName,
  deliveryName,
  deliveryAddress,
  deliveryDate,
  oldStatus,
  newStatus,
  changedBy,
}: DeliveryStatusEmailProps) {
  return (
    <Html lang="ja">
      <Head />
      <Preview>配送ステータスが更新されました: {deliveryName}</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <Heading style={{ color: '#1f2937', fontSize: '24px', marginBottom: '8px' }}>
              配送ステータス更新通知
            </Heading>
            <Text style={{ color: '#6b7280', marginTop: '0' }}>
              {recipientName} 様
            </Text>
            <Hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />

            <Text style={{ color: '#374151', fontSize: '15px' }}>
              以下の配送データのステータスが更新されました。
            </Text>

            <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '16px', marginTop: '16px' }}>
              <Text style={{ margin: '4px 0', color: '#374151' }}><strong>配送名：</strong>{deliveryName}</Text>
              <Text style={{ margin: '4px 0', color: '#374151' }}><strong>住所：</strong>{deliveryAddress}</Text>
              <Text style={{ margin: '4px 0', color: '#374151' }}><strong>配送日：</strong>{deliveryDate}</Text>
              <Text style={{ margin: '4px 0', color: '#374151' }}>
                <strong>ステータス：</strong>
                {statusLabel[oldStatus] ?? oldStatus} → <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{statusLabel[newStatus] ?? newStatus}</span>
              </Text>
              <Text style={{ margin: '4px 0', color: '#6b7280', fontSize: '13px' }}>
                変更者: {changedBy}
              </Text>
            </Section>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
            <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center' }}>
              配送管理システム — この通知は自動送信されています
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}