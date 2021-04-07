import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';

class SurveyController {

    async index(request: Request, response: Request) {
        const surveysRepository = getCustomRepository(SurveysRepository)

        const surveys = await surveysRepository.find();


        return response.status(200).json(surveys)

    }

    async create(request: Request, response: Request) {
        const { title, description } = request.body;
        const surveysRepository = getCustomRepository(SurveysRepository)

        const survey = await surveysRepository.create({
            title,
            description
        });

        await surveysRepository.save(survey);

        return response.status(201).json(survey)

    }
}

export { SurveyController }