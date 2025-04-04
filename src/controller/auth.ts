
import type { Context } from "hono";
import {Database} from 'bun:sqlite'
import { logger } from "hono/logger";
import { User } from "../types";
import { password as bunPassword } from "bun";
import {sign} from 'hono/jwt'
//register new user

export async function registerUser(c  :Context,db: Database) {
    const {username,password, role = "user"} = await c.req.json()

    if(!username || !password){
        return c.json({
            error  : "Username and Password is required !"
            
        },400)
    }

    if(role !== 'user' && role !== 'admin' ){
        return c.json({
            error : "Valid role is required"
        })
    }

    try {
        const existingUser = db.query('SELECT * FROM users WHERE username = ?').get(username) as User | undefined //PREVENTS FROM SQL INJECTION
        if(existingUser){
            return c.json({
                error : "User already exits"
            },400);
        };

        //hash the password 
        const hashedPassword =  await Bun.password.hash(password,{
            algorithm : "bcrypt",
            cost : 4, //consider as round = no of salts
        });

        console.log(hashedPassword);
        

        //insert into db
        db.run("INSERT INTO users (username,password,role) VALUES (?,?,?)",[
                username,hashedPassword,role
        ]);

        return c.json({
            message  : "USer registered successfully"
        },200);

        
    } catch (error) {
        console.log(error);
        return c.json({ error : "Internal Server error "},500);
    }
}

export async function loginUser(c:Context,db:Database){
    //get username and passwd from req body
    const {username,password}  = await c.req.json();

    if(!username || !password){
        return c.json({
            error  : "Username and Password is required !"
            
        },400)
    }

    try {
        const user  = db.query("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;

        if(!user){
            return c.json({error : "No user exists  with this username"});
        };

        //check if passvalid 

        const isPasswordValid = Bun.password.verify(password,user.password);

         if(!isPasswordValid){
            return c.json({error : "Creadentials are not valid"});
        };
        //Implement token using JWT Token sign method

        const token = await sign({
            userId : user.id , role : user.role , password : user.password
        },process.env.JWT_SECRET_KEY || 'JWT_SECRET');

        return c.json({token})        
    } catch (error) {
        console.log(error);
        
        c.json({error : "Internal Server Error "},500);
    }
}