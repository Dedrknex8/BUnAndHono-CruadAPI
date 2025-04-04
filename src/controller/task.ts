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