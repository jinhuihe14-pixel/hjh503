import React from 'react';
import { Form, Input, Button, Toast, Space } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [mode, setMode] = React.useState('login');

  const onSubmit = async (values) => {
    try {
      let res;
      if (mode === 'login') {
        res = await login(values);
      } else {
        res = await register({ ...values, role: 'customer' });
      }
      
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      Toast.show({ content: mode === 'login' ? '登录成功' : '注册成功', icon: 'success' });
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-logo">
        <div className="login-logo-icon">🌸</div>
        <div className="login-logo-text">花艺工作室</div>
        <div className="login-logo-subtitle">遇见美好，从一束花开始</div>
      </div>

      <div className="login-form">
        <Form
          form={form}
          onFinish={onSubmit}
          initialValues={{ username: 'customer1', password: '123456' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" clearable />
          </Form.Item>
          
          {mode === 'register' && (
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" clearable />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input type="password" placeholder="请输入密码" />
          </Form.Item>

          {mode === 'register' && (
            <Form.Item name="phone" label="手机号">
              <Input placeholder="请输入手机号" clearable />
            </Form.Item>
          )}

          <Space direction="vertical" block style={{ marginTop: 24 }}>
            <Button
              block
              color="primary"
              size="large"
              onClick={() => form.submit()}
            >
              {mode === 'login' ? '登录' : '注册'}
            </Button>
          </Space>

          <div style={{ textAlign: 'center', marginTop: 16, color: '#999', fontSize: 14 }}>
            {mode === 'login' ? (
              <span>
                还没有账号？
                <a style={{ color: '#e03131' }} onClick={() => setMode('register')}>立即注册</a>
              </span>
            ) : (
              <span>
                已有账号？
                <a style={{ color: '#e03131' }} onClick={() => setMode('login')}>去登录</a>
              </span>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
