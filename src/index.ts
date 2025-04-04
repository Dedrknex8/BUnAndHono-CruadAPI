import { Hono } from 'hono'
import {initDatabase} from './databse/db'
import {cors} from 'hono/cors';
import {logger} from 'hono/logger';
import { loginUser, registerUser } from './controller/auth';

const app = new Hono()
const db = initDatabase();


//middleware
app.use('*',cors());
app.use('*',logger());
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
export default app
