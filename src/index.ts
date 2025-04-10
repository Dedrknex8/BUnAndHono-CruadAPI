import { Hono, Next,Context } from 'hono'
import {initDatabase} from './databse/db'
import {cors} from 'hono/cors';
import {logger} from 'hono/logger';
import { loginUser, registerUser } from './controller/auth';
import {jwt} from 'hono/jwt'
import { createTask, deleteTask, getSingleTask, getTask, updateTask } from './controller/task';
const app = new Hono()
const db = initDatabase();


//middleware
app.use('*',cors());
app.use('*',logger());

//auth middleware

const auth = jwt({
  secret : process.env.JWT_SECRET_KEY || 'JWT_SECRET_KEY'
});

app.get('/', (c) => {
  return c.text('Hello Word!')
});

app.get('/db-test',(c)=>{
  const result = db.query('SELECT sqlite_version()').get();

  return c.json({
    message : 'DB connected successfully',
    data : {
      result
    }
  })
});


app.post('/register-user',(c)=>registerUser(c,db));
app.post('/login-user',(c)=>loginUser(c,db));

app.post('/task',auth,(c)=> createTask(c,db));
app.get('/task',auth,(c)=>getTask(c,db));
app.get('/tasks/:id',auth,(c)=>getSingleTask(c,db));
app.put('/tasks/:id',auth,(c)=>updateTask(c,db));
app.delete('/tasks/:id',auth,(c)=>deleteTask(c,db));
export default app
