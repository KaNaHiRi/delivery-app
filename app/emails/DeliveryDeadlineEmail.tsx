import {
  Html, Head, Body, Container, Section,
  Heading, Text, Hr, Preview
} from '@react-email/components';

interface DeliveryDeadlineEmailProps {
  recipientName: string;
  deliveries: Array<{
    id: string;
    name: string;
    address: string;
    deliveryDate: string;
    status: string;
  }>;
}

export function DeliveryDeadlineEmail({
  recipientName,
  deliveries,
}: DeliveryDeadlineEmailProps) {
  return (
    <Html lang="ja">
      <Head />
      <Preview>⚠️ 期限が迫っている配送があります ({deliveries.length}件)</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px', border: '1px solid #fca5a5' }}>
            <Heading style={{ color: '#dc2626', fontSize: '24px', marginBottom: '8px' }}>
              ⚠️ 配送期限アラート
            </Heading>
            <Text style={{ color: '#6b7280', marginTop: '0' }}>{recipientName} 様</Text>
            <Hr style={{ borderColor: '#fca5a5', margin: '16px 0' }} />

            <Text style={{ color: '#374151' }}>
              期限が迫っている、または期限超過の配送が <strong>{deliveries.length}件</strong> あります。
            </Text>

            {deliveries.map((d) => (
              <Section key={d.id} style={{ backgroundColor: '#fef2f2', borderRadius: '6px', padding: '12px', marginTop: '12px', borderLeft: '4px solid #ef4444' }}>
                <Text style={{ margin: '2px 0', color: '#374151', fontWeight: 'bold' }}>{d.name}</Text>
                <Text style={{ margin: '2px 0', color: '#6b7280', fontSize: '13px' }}>{d.address}</Text>
                <Text style={{ margin: '2px 0', color: '#dc2626', fontSize: '13px' }}>配送予定日: {d.deliveryDate}</Text>
              </Section>
            ))}

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