import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository";

class NPSController {

    async execute(request: Request, response: Response) {

        const { survey_id } = request.params;

        const surveysUserRepository = getCustomRepository(SurveyUsersRepository);

        const surveysUsers = await surveysUserRepository.find({
            survey_id,
            value:Not(IsNull())
        });

        const detractor = surveysUsers.filter(
            survey => survey.value >= 0 && survey.value <= 6).length;

        const promoters = surveysUsers.filter(
            survey => survey.value >= 9 && survey.value <= 10).length;

        const passive = surveysUsers.filter(
            survey => survey.value >= 7 && survey.value <= 8).length;
        
        const totalAnswer = surveysUsers.length;
        
        const calculate = ((promoters - detractor) / totalAnswer) * 100;

        return response.json({
            detractor: detractor,
            promoters: promoters,
            passsive: totalAnswer,
            nps: (calculate.toFixed(2)) +"%"
        });
    }

}

export { NPSController }