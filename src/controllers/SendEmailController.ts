import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { app } from "../app";
import { AppError } from "../errors/AppErrors";
import { SurveyRepository } from "../repositories/SurveyRepository";
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository";
import { UserRepository } from "../repositories/UserRepository";
import SendMailService from "../services/SendMailService";

class SendEmailController{
 
    async execute(request: Request, response: Response){
        const {email, survey_id} = request.body;

        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);
        const surveyUsersRepository = getCustomRepository(SurveyUsersRepository);

        const user = await userRepository.findOne({email: email});

        if(!user){
            throw new AppError("User does not exists");
        }

        const survey = await surveyRepository.findOne({id: survey_id});

        if(!survey){
           throw new AppError("Survey does not exists");
        }
        
        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
       

        const surveyUserAlreadyExists =await  surveyUsersRepository.findOne({
            where:[{user_id: user.id, value: null}]
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if(surveyUserAlreadyExists){
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }

        const surveyUser = surveyUsersRepository.create({
                user_id:user.id,
                survey_id: survey_id
        });

        await surveyUsersRepository.save(surveyUser);
        variables.id = surveyUser.id
       

        await SendMailService.execute(email, survey.title, variables, npsPath);        
        return response.json(surveyUser);
    }
}

export { SendEmailController };

