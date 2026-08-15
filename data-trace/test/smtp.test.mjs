// SMTP 通道测试：本地模拟 SMTP 服务器（明文、无 STARTTLS，仅验证协议交互与消息构建）。
// 真实 Gmail（smtp.gmail.com:587 + STARTTLS）由上线前的真发测试覆盖。
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import test from 'node:test';
import { isMailConfigured, sendEmail } from '../src/mail/sender.mjs';

function startMockSmtp() {
  const received = { commands: [], messageLines: [], auth: [] };
  const server = createServer((socket) => {
    socket.write('220 mock ESMTP\r\n');
    let buffer = '';
    let inData = false;
    let authCount = 0;
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      let index;
      while ((index = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (inData) {
          if (line === '.') { inData = false; socket.write('250 queued\r\n'); continue; }
          received.messageLines.push(line);
          continue;
        }
        received.commands.push(line);
        const upper = line.toUpperCase();
        if (upper.startsWith('EHLO')) {
          socket.write('250-mock ESMTP\r\n250 AUTH LOGIN PLAIN\r\n');
        } else if (upper === 'AUTH LOGIN') {
          socket.write('334 VXNlcm5hbWU6\r\n');
        } else if (authCount === 0 && !upper.startsWith('MAIL') && !upper.startsWith('RCPT') && upper !== 'DATA' && !upper.startsWith('QUIT')) {
          authCount += 1;
          received.auth.push(Buffer.from(line, 'base64').toString('utf8'));
          socket.write('334 UGFzc3dvcmQ6\r\n');
        } else if (authCount === 1 && !upper.startsWith('MAIL') && !upper.startsWith('RCPT') && upper !== 'DATA' && !upper.startsWith('QUIT')) {
          authCount += 1;
          received.auth.push(Buffer.from(line, 'base64').toString('utf8'));
          socket.write('235 ok\r\n');
        } else if (upper.startsWith('MAIL FROM') || upper.startsWith('RCPT TO')) {
          socket.write('250 ok\r\n');
        } else if (upper === 'DATA') {
          inData = true;
          socket.write('354 go\r\n');
        } else if (upper.startsWith('QUIT')) {
          socket.write('221 bye\r\n');
          socket.end();
        }
      }
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, received })));
}

test('SMTP 通道：完整协议交互、凭据、消息构建与点号转义', async () => {
  const { server, received } = await startMockSmtp();
  const port = server.address().port;
  const env = {
    MAIL_TRANSPORT: 'smtp',
    MAIL_SMTP_HOST: '127.0.0.1',
    MAIL_SMTP_PORT: String(port),
    MAIL_SMTP_SECURE: '0',
    MAIL_SMTP_USER: 'sender@gmail.com',
    MAIL_SMTP_PASS: 'app-password-16chars',
    MAIL_FROM: 'DataTrace <no-reply@datatrace.example>'
  };
  assert.equal(isMailConfigured(env), true);

  const outcome = await sendEmail(env, {
    to: 'test-recipient@example.com',
    subject: '每日简报 · 测试',
    text: 'Hello DataTrace.\n.Second line starts with dot.',
    html: '<p>Hello DataTrace</p>',
    headers: { unsubscribeUrl: 'https://datatrace.example/unsub' }
  });
  assert.equal(outcome.ok, true);
  await new Promise((resolve) => server.close(resolve));

  // 协议序列
  assert.equal(received.commands[0], 'EHLO datatrace.local');
  assert.ok(received.commands.includes('AUTH LOGIN'));
  assert.deepEqual(received.auth, ['sender@gmail.com', 'app-password-16chars']);
  assert.ok(received.commands.some((cmd) => cmd === 'MAIL FROM:<no-reply@datatrace.example>'));
  assert.ok(received.commands.some((cmd) => cmd === 'RCPT TO:<test-recipient@example.com>'));
  assert.ok(received.commands.includes('DATA'));
  assert.ok(received.commands.some((cmd) => cmd.startsWith('QUIT')));

  // 消息构建
  const message = received.messageLines.join('\n');
  assert.match(message, /^From: DataTrace <no-reply@datatrace\.example>/);
  assert.match(message, /^To: test-recipient@example\.com/m);
  assert.match(message, /^Subject: =\?UTF-8\?B\?/m); // 非 ASCII 主题 RFC 2047
  assert.match(message, /List-Unsubscribe: <https:\/\/datatrace\.example\/unsub>, <mailto:no-reply@datatrace\.example>/);
  assert.match(message, /Content-Type: multipart\/alternative; boundary="/);
  assert.match(message, /^..Second line starts with dot\.$/m); // 点号转义
  assert.ok(message.includes('<p>Hello DataTrace</p>'));
});

test('SMTP 通道：连接失败时返回 ok:false 而非抛出', async () => {
  const env = {
    MAIL_TRANSPORT: 'smtp',
    MAIL_SMTP_HOST: '127.0.0.1',
    MAIL_SMTP_PORT: '1', // 无人监听的端口
    MAIL_SMTP_SECURE: '0',
    MAIL_SMTP_USER: 'sender@gmail.com',
    MAIL_SMTP_PASS: 'x',
    MAIL_FROM: 'DataTrace <no-reply@datatrace.example>'
  };
  const outcome = await sendEmail(env, { to: 'a@b.example', subject: 'x', text: 'y' });
  assert.equal(outcome.ok, false);
  assert.ok(outcome.result.message);
});

test('isMailConfigured：HTTP 与 SMTP 两种模式判定', () => {
  assert.equal(isMailConfigured({ MAIL_API_URL: 'u', MAIL_API_KEY: 'k' }), true);
  assert.equal(isMailConfigured({ MAIL_API_URL: 'u' }), false);
  assert.equal(isMailConfigured({ MAIL_TRANSPORT: 'smtp', MAIL_SMTP_HOST: 'h', MAIL_SMTP_USER: 'u', MAIL_SMTP_PASS: 'p', MAIL_FROM: 'f' }), true);
  assert.equal(isMailConfigured({ MAIL_TRANSPORT: 'smtp', MAIL_SMTP_HOST: 'h' }), false);
});
