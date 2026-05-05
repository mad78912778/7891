const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const codeMap = new Map();

// 你的QQ邮箱配置
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '3954443513@qq.com',
    pass: 'jfctgcnafstdcfjh'
  }
});

// 发送验证码接口
app.post('/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ ok: false, msg: '邮箱不能为空' });

  // 校验邮箱格式
  let reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if(!reg.test(email)){
    return res.json({ ok: false, msg: '邮箱格式错误，请输入真实有效邮箱' });
  }

  // 生成6位验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeMap.set(email, code);

  try {
    await transporter.sendMail({
      from: '"MAD App 注册" <3954443513@qq.com>',
      to: email,
      subject: '您的注册验证码',
      text: `验证码：${code}\n5分钟内有效，请勿泄露。`
    });
    res.json({ ok: true, msg: '验证码已发送，请到邮箱查收' });
  } catch (e) {
    res.json({ ok: false, msg: '发送失败！请确认邮箱真实存在且能正常收邮件' });
  }
});

// 验证验证码
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const realCode = codeMap.get(email);
  if (realCode && realCode === code) {
    res.json({ ok: true, msg: '验证通过' });
    codeMap.delete(email);
  } else {
    res.json({ ok: false, msg: '验证码错误或已过期' });
  }
});

app.listen(3000, () => {
  console.log('✅ 验证码服务已启动：http://localhost:3000');
});

