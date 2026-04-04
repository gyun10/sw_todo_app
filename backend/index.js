require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.log(err));

// Todo 스키마 정의 (우선순위와 마감일 추가!)
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }, // 우선순위
  dueDate: { type: String, default: '' }, // 마감일 (YYYY-MM-DD 형식으로 저장)
  notes: { type: String, default: '' },
  category: { type: String, default: 'Tasks' }
});
const Todo = mongoose.model('Todo', todoSchema);

// API 엔드포인트
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  // 넘어오는 모든 데이터를 알아서 스키마에 맞춰 저장합니다!
  const newTodo = new Todo(req.body); 
  await newTodo.save();
  res.json(newTodo);
});

app.put('/api/todos/:id', async (req, res) => {
  // 프론트에서 보낸 수정된 데이터(제목, 메모, 날짜 등)를 통째로 덮어씌웁니다.
  const todo = await Todo.findByIdAndUpdate(
    req.params.id, 
    { ...req.body }, 
    { new: true }
  );
  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: '삭제 완료' });
});

module.exports = app;

// 로컬에서 실행할 때만 app.listen이 작동하도록 조건부 처리
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
}