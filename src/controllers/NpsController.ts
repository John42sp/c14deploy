import { Request, Response } from 'express';
import { getCustomRepository, Not, IsNull } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';


class NpsController {

    /* 
    value: 1,2,3,4,5,6,7,8,9,10
    Detratores: 0-6,
    Passivos: 7-8,
    Promotores: 9-10
    calculo de NPS: ( (nº promotores - nº Detratores) / nº respondentes ) * 100
    Peqgar no banco o nº dos detratores e promotores, e dividir p/ total de respondentes, referente a uma pesquisa
    */

    async execute(req:Request, res: Response) {

        const { survey_id } = req.params;  //identificar de qual pesquisa, vem da url

        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository); 

        const surveyUsers = await surveysUsersRepository.find({  //encontrar todos 'surveyUsers' com esta pesquisa, p/ survey_id
            survey_id,
            value: Not(IsNull()),
        });

        const detractors = surveyUsers.filter((survey => survey.value <= 6)).length;

        const passive = surveyUsers.filter((survey => survey.value >= 7 && survey.value <= 8)).length;

        const promoters = surveyUsers.filter((survey => survey.value >= 8)).length;

        const totalAnswers = await surveyUsers.length;

        const calculateNps = Number(((promoters - detractors / totalAnswers) * 100).toFixed(2)); 
        //.toFixed formata nº casas decimais apos virgula, mas torna em string. Forçando ficar como Number
        
        return res.json({
            detractors,
            passive,
            promoters,
            totalAnswers,
            nps: calculateNps
        })

    }
    

}

export { NpsController }