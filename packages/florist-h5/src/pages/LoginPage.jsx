import React from 'react';
import { Form, Input, Button, Toast, Space } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    try {
      const res = await login(values);
      
      if (res.user.role !== 'florist') {
        Toast.show({ content: '请使用花艺师账号登录', icon: 'fail' });
        return;
      }
      
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      Toast.show({ content: '登录成功', icon: 'success' });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-logo">
        <div className="login-logo-icon">💐</div>
        <div className="login-logo-text">花艺师工作台</div>
        <div className="login-logo-subtitle">专业 · 高效 · 匠心</div>
      </div>

      <div className="login-form">
        <Form
          form={form}
          onFinish={onSubmit}
          initialValues={{ username: 'florist1', password: '123456' }}
        >
          <Form.Item
            name="username"
            label="工号/用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" clearable />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input type="password" placeholder="请输入密码" />
          </Form.Item>

          <Space direction="vertical" block style={{ marginTop: 24 }}>
            <Button
              block
              color="primary"
              size="large"
              onClick={() => form.submit()}
            >
              登录
            </Button>
          </Space>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
