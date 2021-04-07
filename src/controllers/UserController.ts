
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UsersRepository } from '../repositories/UserRepositories';
import * as yup from 'yup';
import { AppError } from '../errors/AppErrors';

class UserController {

    async index(request: Request, response: Response) {
        // const { name, email } = request.body;

        const userRepository = getCustomRepository(UsersRepository); //aqui foi isolado repo do controller, repo esta em file 'UserRepositories.ts'

        const users = await userRepository.find()


        return response.json(users);
    }


    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        const schema = yup.object().shape({
            name: yup.string().required("Nome obrigatório"),
            email: yup.string().email().required("Email inválido")
        })
        //validação simples:
        // if(!(await schema.isValid(request.body))) {
        //     return response.status(400).json({ error: "Validation failed!"})
        // } 
        //OU mais complexa:
        try {

            await schema.validate(request.body, { abortEarly: false })
            
        } catch(err){

            throw new AppError(err)  //messg erro com cod 400 padronizado
            
            // return response.status(400).json({ error: err})

        }        

        const userRepository = getCustomRepository(UsersRepository); //aqui foi isolado repo do controller, repo esta em file 'UserRepositories.ts'

        const userExists = await userRepository.findOne({
            email
        })

        if(userExists) {
            // throw new Error( ) //ESTE É O ERR PADRÃO DO JS, MAS ESTAMOS CRIANDO CLASSE CUSTOMIZADA
            throw new AppError("User already exists!")  //messg erro com cod 400 padronizado
            // return response.status(400).json({
            //     error: "User already exists!"
            // })
        }

        const user = userRepository.create({
            name,
            email
        })
        await userRepository.save(user);

        return response.json(user);
    }
}

export { UserController };
