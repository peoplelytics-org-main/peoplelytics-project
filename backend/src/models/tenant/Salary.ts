import { Schema, Document } from 'mongoose';

export interface ISalaryAndCompensation extends Document{
    employeeId:string;
    name:string;
    salary:number;
    bonus:number;
    lastRaiseAmount?:number;
    compensationSatisfaction?:number;
    benefitsSatisfaction?:number;
}

export const SalaryAndCompensationSchema= new Schema <ISalaryAndCompensation>({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    compensationSatisfaction: {
        type: Number,
        min: 1,
        max: 100
    },
    benefitsSatisfaction: {
        type: Number,
        min: 1,
        max: 100
    },

    bonus: {
        type: Number,
        min: 0
    },
    lastRaiseAmount: {
        type: Number,
        min: 0
    },
},{
    timestamps: true,
    collection: 'salary_and_compensation'

})