import { Request, Response } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UserRepositories';
import SendMailServices from '../services/SendMailServices';
import { resolve } from 'path'; //vem com o node, p/ trilhar o caminho com arquivo de handlebars/templates
import { AppError } from '../errors/AppErrors';



class SendMailController {
    async execute(request: Request, response: Response){
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({email});
        const survey = await surveysRepository.findOne({id: survey_id}); //id=oque esta no repo, survey_id= vem do user
        const surveyUserExists = await surveysUsersRepository.findOne({ 
            // where: [{user_id: user.id}, {value: null}], //condição OR, não seria suficiente para encontrar su
            where: {user_id: user.id, value: null}, //condição AND = precisa passar as duas para se referir ao su
            relations: ["user", "survey"]
        })

        if(!user) {
            return response.status(401).json({
                error: "User does not exist!"
            })
        }

        if(!survey) {

            throw new AppError("Survey does not exist!")  //messg erro com cod 400 padronizado
            // return response.status(401).json({
            //     error: "Survey does not exist!"
            // })
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs"); //esta linha estava no SendMailService p/ deixar o SendMailService mais generico, usalo p/ outras menssagens
//AQUI ENVIA O USER_ID NA URL, NÃO É BOM
        // const variables = {  //variaveis sendo usadas no npsMail.hbs, colocadas pelo SendMailService.execute(html)
        //     name:user.name,
        //     title: survey.title,
        //     description: survey.description,
        //     user_id: user.id,//mudou envio na url do user_id pro surveyUser. Ou poderia ser envio user_id + survey
        //     link: process.env.URL_MAIL
        // }
//ENVIANDO SURVEYUSER NA URL
        // const variables = {  //variaveis sendo usadas no npsMail.hbs, colocadas pelo SendMailService.execute(html)
        //     name:user.name,
        //     title: survey.title,
        //     description: survey.description,
        //     id: surveyUserExists.id,//modo desejado, mas o surveyUser poderia ainda não existir. 
        //     link: process.env.URL_MAIL
        // }

        const variables = {  //variaveis sendo usadas no npsMail.hbs, colocadas pelo SendMailService.execute(html)
            name:user.name,
            title: survey.title,
            description: survey.description,
            id: "",       //aqui deixa o surveyUser_id criado, e subscreve o valor logo abaixo
            link: process.env.URL_MAIL
        }
//ATENÇÃO:  id:"";        
//funciona conforme a condição: se surveyUser existir, é colocado com o id existente, se não, coloca o id sendo criado
//no 
        if(surveyUserExists) {  //não deixara criar novos surveyUsers, se novo com mesmousuário e valor nulo ja existir
            variables.id = surveyUserExists.id; //colocando id do surveyUser se ja existir
            await SendMailServices.execute(email, survey.title, variables, npsPath)//apenas executará o codigo restante
            return response.json(surveyUserExists)
        }

        //salvar infos na tabela 
        const surveyUser = surveysUsersRepository.create({  //caso surveyUser não esistir, criará um novo
            user_id: user.id,
            survey_id
        })

        await surveysUsersRepository.save(surveyUser);
        variables.id = surveyUser.id; //colocando id do surveyUser, se estiver sendo criado agora
        //email p/ onde queremos enciar a pesquisa de satisfação, o assunto(title), do repositório survey, e description
        await SendMailServices.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export { SendMailController };