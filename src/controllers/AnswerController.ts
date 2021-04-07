import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { AppError } from '../errors/AppErrors';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

//AQUI SALVAREMOS A RESPOSTA DO USER COM O 'VALUE' NO SURVEYUSER, QUE ESTAVA NULL ATÉ AGORA
class AnswerController {

    //http://localhost:3333/answers/1?u=eda8c2f2-b107-4be9-9c57-6e26ce3fa0f8
    
    //Route Params: parametros q compem a rota/url ex: :value
    //route.get("/answers/:value")

    // Query Params: parametros apos '?' (chave=valor), para filtrar, paginar, buscar, tbm na url. Não obrigatorios

    async execute(request: Request, response:Response) {
        const { value } = request.params;
        const { u } = request.query;

        const surveysUsersRepository = await getCustomRepository(SurveysUsersRepository);

        const surveyUser = await surveysUsersRepository.findOne({
            // id: u, //u poderia dar undefined
            id: String(u)  //forçando o U a ser uma string, conforme definido no model / id: string = PARSING
        });

        if(!surveyUser) {
            // throw new Error(); //SUBSTITUI O RETURN ABAIXO POR ESTA LINHA
            // throw new AppError("SurveyUser doesn t exist!", 400)
            throw new AppError("SurveyUser doesn t exist!")  //messg erro com cod 400 padronizado
            
            // return response.status(400).json({
            //     error: "SurveyUser doesn t exist!"
            // })
        }
        // surveyUser.value = value; //poderia dar undefined
        //FAZER PARSING / TRANSPORMANDO DE STRING PRA NUMBER
        surveyUser.value = Number(value); //forçar value ser um number, como esta definido no model

        await surveysUsersRepository.save(surveyUser);
        return response.json(surveyUser);

        //CRIAR NOVA ROTA: router.get("/answer")
    }

}

export { AnswerController }