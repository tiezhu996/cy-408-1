import { useEffect } from 'react';
import { Avatar, Card, Collapse, Row, Col, Statistic, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CompanyPool } from '../../../shared/types/entities';
import { StatusBadge } from '../components/common/StatusBadge';
import { useCompanyPoolStore } from '../stores/companyPool';

export function CompanyPoolPage() {
  const { pools, load } = useCompanyPoolStore();
  const navigate = useNavigate();

  useEffect(() => { void load(); }, [load]);

  const totalContacts = pools.reduce((sum, pool) => sum + pool.contactCount, 0);
  const totalReferrals = pools.reduce((sum, pool) => sum + pool.referralCount, 0);

  const handleContactClick = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const renderContactItem = (pool: CompanyPool) => (
    <Row gutter={[16, 16]} className="contact-list">
      {pool.contactReferrals.map(({ contact, referral }) => (
        <Col span={12} key={contact.id}>
          <Card
            className="soft-card contact-item"
            hoverable
            onClick={() => handleContactClick(contact.id)}
          >
            <Row gutter={12} align="middle">
              <Col>
                <Avatar src={contact.avatar} size={48}>
                  {contact.name.slice(0, 1)}
                </Avatar>
              </Col>
              <Col flex="auto">
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {contact.name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {contact.position}
                </Typography.Text>
                <div className="tag-row">
                  {contact.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Col>
              <Col>
                {referral ? (
                  <StatusBadge status={referral.status} />
                ) : (
                  <Tag color="default">待内推</Tag>
                )}
              </Col>
            </Row>
            {referral && (
              <div className="referral-info">
                <Typography.Text type="secondary">
                  目标职位：{referral.targetPosition}
                </Typography.Text>
                {referral.feedback.length > 0 && (
                  <Typography.Text type="secondary" className="feedback-preview">
                    最新反馈：{referral.feedback[referral.feedback.length - 1].content}
                  </Typography.Text>
                )}
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );

  const items = pools.map((pool) => ({
    key: pool.companyName,
    label: (
      <div className="panel-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {pool.companyName}
        </Typography.Title>
        <div className="panel-stats">
          <Statistic title="联系人" value={pool.contactCount} />
          <Statistic title="内推中" value={pool.referralCount} />
        </div>
      </div>
    ),
    children: renderContactItem(pool)
  }));

  return (
    <div className="stack">
      <Row gutter={16}>
        <Col span={8}>
          <Card className="soft-card">
            <Statistic title="公司总数" value={pools.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="soft-card">
            <Statistic title="联系人总数" value={totalContacts} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="soft-card">
            <Statistic title="内推总数" value={totalReferrals} />
          </Card>
        </Col>
      </Row>
      <Collapse
        items={items}
        defaultActiveKey={pools.length > 0 ? [pools[0].companyName] : []}
        accordion
      />
    </div>
  );
}
