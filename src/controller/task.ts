import {Context} from 'hono'
import {Database} from 'bun:sqlite'
import { Tasks } from '../types';

export async function createTask(c : Context,db : Database){
    const userId = c.get('jwtPayload').userId;
    const userRole = c.get('jwtPayload').role;

   
    
    const {title,description,user_id} = await c.req.json()
    
    if(!userId){
        return c.json({
            error : "Access not Granted"
        },401)
    }

    if(userRole !== 'admin'){
        return c.json({
            error : 'Unathorized Access, Only admin can creatre a post'
        },403);
    };

    if(userId !== user_id){
        return c.json({
            error  : "Invalid user with diff user id"
        },403);
    }

    

    try {
        
        const result = db.query(`
            INSERT INTO tasks (user_id,title,description)  VALUES (?,?,?) RETURNING *
            `).get(user_id,title,description) as Tasks;


            return c.json({
                result
            },201);

    } catch (error) {
        console.log(error);
        return c.json({
            error : "Internal Server Error"
        })
        
    }
}

export async function getTask(c: Context, db :Database){
    try {
        const extractALLtask = db.query("SELECT * FROM tasks").all() as Tasks[];
        return c.json(extractALLtask,200);

    } catch (error) {
        return c.json({error : "Internal Server Eroor"},500)
    }
}

export async function getSingleTask(c:Context,db:Database){
    //get the taskid
    const taskId = c.req.param('id');
    try {
        //extract the task from db

        const extractTask = db.query("SELECT * FROM tasks WHERE id =?").get(taskId) as Tasks | undefined;

        if(!extractTask){
            return c.json({error : "Can't fetch task with this id! Try again later"});
        }

        return c.json({
            messsage : 'task fetched sucessfully',
            data : extractTask
        });


    } catch (error) {
        console.log(error);
        return c.json({error : "Internal Server error"});
        
    }
}

export async function updateTask(c:Context,db:Database){
    const userId = c.get('jwtPayload').userId;
    const userRole = c.get('jwtPayload').role;
    const taskId = c.req.param('id');

    const {title,description,user_id} = await c.req.json();

    if(!userId){
        return c.json({
            error : "Access not Granted"
        },401)
    }


    if(userRole!=="admin"){
        return c.json({error  : "UnAuthorized access !"});
    }
    if(userId !== user_id){
        return c.json({
            error  : "Invalid user with diff user id"
        },403);
    }

    try {
        const extractExistingTask = db.query("SELECT * FROM tasks WHERE id=?").get(taskId) as Tasks | undefined;

        const extractUser = await db.query(`UPDATE tasks SET title = ?,description =?,user_Id =? WHERE id=?`).get(title || extractExistingTask?.title,description !== undefined ? description :  extractExistingTask?.description,userId || extractExistingTask?.user_id,taskId) as Tasks;

        return c.json(updateTask,200)



    } catch (error) {
        console.log(error);
        
        return c.json({error : "Internal Server error"},500);
    }
}