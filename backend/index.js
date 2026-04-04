require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.log(err));

// User 스키마
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Todo 스키마 (userId 추가)
const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  due: { type: String, default: '' },
  notes: { type: String, default: '' },
  cat: { type: String, default: "일상" },
}, { timestamps: true });
const Todo = mongoose.model('Todo', todoSchema);

// Auth 미들웨어
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '인증이 필요합니다.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 회원가입
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed });
  await user.save();
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, email: user.email });
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, email: user.email });
});

// Todo API (인증 필요)
app.get('/api/todos', authMiddleware, async (req, res) => {
  const todos = await Todo.find({ userId: req.userId });
  res.json(todos);
});

app.post('/api/todos', authMiddleware, async (req, res) => {
  const newTodo = new Todo({ ...req.body, userId: req.userId });
  await newTodo.save();
  res.json(newTodo);
});

app.put('/api/todos/:id', authMiddleware, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...req.body },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });
  res.json(todo);
});

app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: '삭제 완료' });
});

// 비밀번호 변경
app.put('/api/auth/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
  if (newPassword.length < 6)
    return res.status(400).json({ message: '새 비밀번호는 6자 이상이어야 합니다.' });
  const user = await User.findById(req.userId);
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: '비밀번호가 변경되었습니다.' });
});

// 계정 탈퇴
app.delete('/api/auth/account', authMiddleware, async (req, res) => {
  await Todo.deleteMany({ userId: req.userId });
  await User.findByIdAndDelete(req.userId);
  res.json({ message: '계정이 삭제되었습니다.' });
});

module.exports = app;

// 로컬에서 실행할 때만 app.listen이 작동하도록 조건부 처리
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
}
